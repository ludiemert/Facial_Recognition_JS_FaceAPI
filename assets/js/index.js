const video = document.getElementById("videoElement");
const messageBox = document.getElementById("messageBox");
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");

let stream; // Variável para armazenar o stream da câmera

startButton.addEventListener("click", async () => {
	// Obtém dispositivos de mídia e inicia o stream da câmera
	const devices = await navigator.mediaDevices.enumerateDevices();
	const videoDevice = devices.find(
		(device) =>
			device.kind === "videoinput" && device.label.includes("04f2:b3f6"),
	);

	if (videoDevice) {
		try {
			stream = await navigator.mediaDevices.getUserMedia({
				video: { deviceId: { exact: videoDevice.deviceId } },
			});
			video.srcObject = stream;
			video.style.display = "block"; // Exibe o vídeo
			messageBox.style.display = "none"; // Oculta a caixa de mensagem
		} catch (error) {
			console.error("Erro ao acessar a câmera: ", error);
			messageBox.textContent = "Erro ao acessar a câmera. Tente novamente.";
			messageBox.style.display = "flex"; // Exibe a caixa de mensagem em caso de erro
		}
	}
});

stopButton.addEventListener("click", () => {
	// Para o stream da câmera
	if (stream) {
		const tracks = stream.getTracks(); // Obtém as tracks do stream
		if (tracks.length > 0) {
			for (const track of tracks) {
				track.stop(); // Para cada track
			}
		}
		video.style.display = "none"; // Oculta o vídeo
		messageBox.style.display = "flex"; // Exibe a caixa de mensagem
	} else {
		console.warn("Nenhum stream ativo para parar.");
	}
});
