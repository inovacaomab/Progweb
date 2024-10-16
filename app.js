// Detectar plataforma
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const installButton = document.getElementById('install-button');
const iosInstallPrompt = document.getElementById('install-ios');

// Registrar Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('service-worker.js');
            console.log('Service Worker registrado com sucesso:', registration.scope);
        } catch (error) {
            console.error('Erro ao registrar Service Worker:', error);
        }
    });
}

// Lógica para instalação no Android
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Mostrar o botão de instalação apenas para Android
    if (!isIOS) {
        installButton.style.display = 'block';
    }
});

installButton.addEventListener('click', async (e) => {
    if (!deferredPrompt) return;
    
    installButton.style.display = 'none';
    deferredPrompt.prompt();
    
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Usuário ${outcome === 'accepted' ? 'aceitou' : 'recusou'} a instalação`);
    deferredPrompt = null;
});

// Lógica para instalação no iOS
if (isIOS) {
    // Verificar se já está instalado
    if (!navigator.standalone) {
        iosInstallPrompt.style.display = 'block';
    }
}

// Detectar quando o app foi instalado com sucesso
window.addEventListener('appinstalled', (evt) => {
    console.log('App instalado com sucesso!');
    installButton.style.display = 'none';
    iosInstallPrompt.style.display = 'none';
});