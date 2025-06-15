// Script para inyectar en la consola del navegador
// Para testing del logo derecho

console.log('=== SCRIPT DE TEST LOGO DERECHO ===');

// Encontrar elementos
const leftLogo = document.getElementById('floatingLogoLeft');
const rightLogo = document.getElementById('floatingLogoRight');

console.log('Left logo encontrado:', !!leftLogo);
console.log('Right logo encontrado:', !!rightLogo);

if (leftLogo) console.log('Left classes:', leftLogo.className);
if (rightLogo) console.log('Right classes:', rightLogo.className);

// Función para mostrar logo derecho
function showRightLogo() {
    if (!rightLogo) {
        console.error('Logo derecho no encontrado!');
        return;
    }
    
    console.log('Mostrando logo derecho...');
    leftLogo.classList.add('hidden-logo');
    rightLogo.classList.remove('hidden-logo');
    
    console.log('Después del cambio:');
    console.log('Left classes:', leftLogo.className);
    console.log('Right classes:', rightLogo.className);
}

// Función para mostrar logo izquierdo
function showLeftLogo() {
    if (!leftLogo) {
        console.error('Logo izquierdo no encontrado!');
        return;
    }
    
    console.log('Mostrando logo izquierdo...');
    leftLogo.classList.remove('hidden-logo');
    rightLogo.classList.add('hidden-logo');
    
    console.log('Después del cambio:');
    console.log('Left classes:', leftLogo.className);
    console.log('Right classes:', rightLogo.className);
}

// Exponer funciones globalmente
window.showRightLogo = showRightLogo;
window.showLeftLogo = showLeftLogo;

console.log('Funciones disponibles:');
console.log('- showRightLogo() - para mostrar logo derecho');
console.log('- showLeftLogo() - para mostrar logo izquierdo');

// Test automático
console.log('Iniciando test automático en 3 segundos...');
setTimeout(() => {
    console.log('TEST 1: Mostrando logo derecho');
    showRightLogo();
    
    setTimeout(() => {
        console.log('TEST 2: Volviendo a logo izquierdo');
        showLeftLogo();
        
        setTimeout(() => {
            console.log('TEST 3: Mostrando logo derecho otra vez');
            showRightLogo();
        }, 3000);
    }, 3000);
}, 3000);
