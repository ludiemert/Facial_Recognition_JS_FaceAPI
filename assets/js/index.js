const video = document.getElementById("videoElement");
const messageBox = document.getElementById("messageBox");
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
let stream;

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

// Importar modelos de redes neurais da face-api
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

// Cria um canvas para colocar todas as informações que estamos utilizando
video.addEventListener("play", async () => {
	// Remove canvas existente, se houver
	const existingCanvas = document.querySelector("canvas");
	if (existingCanvas) {
		existingCanvas.remove();
	}

	// Crie um canvas com base no vídeo
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");

	// Ajuste o tamanho do canvas para o tamanho real do vídeo, mas menor
	const displaySize = {
		width: video.videoWidth * 0.7,
		height: video.videoHeight * 0.7,
	};

	canvas.width = displaySize.width;
	canvas.height = displaySize.height;

	document.body.appendChild(canvas);

	faceapi.matchDimensions(canvas, displaySize);

	// Detectar faces e landmarks periodicamente
	setInterval(async () => {
		const detections = await faceapi
			.detectAllFaces(
				video,
				new faceapi.TinyFaceDetectorOptions({
					inputSize: 320,
					scoreThreshold: 0.5,
				}),
			)
			.withFaceLandmarks()
			.withFaceExpressions();

		// Redimensione os resultados da detecção para corresponder ao tamanho do canvas
		const resizedDetections = faceapi.resizeResults(detections, displaySize);
		// Limpe o canvas antes de desenhar novamente
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		// Desenhe as detecções e landmarks
		faceapi.draw.drawDetections(canvas, resizedDetections);
		faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
		faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
	}, 100);
});
