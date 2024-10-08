const video = document.getElementById("videoElement");
const messageBox = document.getElementById("messageBox");
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");

let stream; // Variável para armazenar o stream da câmera

// Função para iniciar o vídeo da câmera
const startVideo = async () => {
	try {
		const devices = await navigator.mediaDevices.enumerateDevices();
		const videoDevice = devices.find(
			(device) =>
				device.kind === "videoinput" && device.label.includes("04f2:b3f6"),
		);

		if (videoDevice) {
			stream = await navigator.mediaDevices.getUserMedia({
				video: { deviceId: { exact: videoDevice.deviceId } },
			});
			video.srcObject = stream;
			video.style.display = "block"; // Exibe o vídeo
			messageBox.style.display = "none"; // Oculta a caixa de mensagem
		} else {
			throw new Error("Nenhum dispositivo de vídeo encontrado.");
		}
	} catch (error) {
		console.error("Erro ao acessar a câmera: ", error);
		messageBox.textContent = "Erro ao acessar a câmera. Tente novamente.";
		messageBox.style.display = "flex"; // Exibe a caixa de mensagem em caso de erro
	}
};

// Função para parar o stream de vídeo
const stopVideo = () => {
	if (stream) {
		const tracks = stream.getTracks(); // Obtém as tracks do stream
		for (const track of tracks) {
			track.stop(); // Para cada track
		}
		video.style.display = "none"; // Oculta o vídeo
		messageBox.style.display = "flex"; // Exibe a caixa de mensagem
	} else {
		console.warn("Nenhum stream ativo para parar.");
	}
};

// Adiciona eventos para os botões de iniciar e parar o vídeo
startButton.addEventListener("click", startVideo);
stopButton.addEventListener("click", stopVideo);

// Importa modelos de redes neurais da face-api
Promise.all([
	faceapi.nets.tinyFaceDetector.loadFromUri("/assets/lib/face-api/models"),
	faceapi.nets.faceLandmark68Net.loadFromUri("/assets/lib/face-api/models"),
	faceapi.nets.faceRecognitionNet.loadFromUri("/assets/lib/face-api/models"),
	faceapi.nets.faceExpressionNet.loadFromUri("/assets/lib/face-api/models"),
	faceapi.nets.ageGenderNet.loadFromUri("/assets/lib/face-api/models"),
	faceapi.nets.ssdMobilenetv1.loadFromUri("/assets/lib/face-api/models"),
]).then(() => {
	console.log("Modelos carregados com sucesso.");
});
