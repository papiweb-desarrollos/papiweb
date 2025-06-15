#!/bin/bash

# Script de verificación para GitHub Pages
# Verifica que todos los recursos críticos estén accesibles

BASE_URL="https://papiweb-desarrollos.github.io/papiweb"

echo "🔍 Verificando recursos de GitHub Pages..."
echo "📍 Base URL: $BASE_URL"
echo ""

# Función para verificar URL
check_url() {
    local url="$1"
    local description="$2"
    
    printf "%-50s" "$description:"
    
    if curl -s -I "$url" | grep -q "HTTP/2 200"; then
        echo "✅ OK"
        return 0
    else
        echo "❌ FALLO"
        return 1
    fi
}

# Verificar recursos principales
check_url "$BASE_URL/" "Página principal"
check_url "$BASE_URL/index.html" "index.html"
check_url "$BASE_URL/papiweb_branding.html" "papiweb_branding.html"

echo ""
echo "📦 Verificando recursos estáticos..."

# Verificar media.json
check_url "$BASE_URL/media.json" "media.json (raíz)"
check_url "$BASE_URL/public/media.json" "media.json (public)"

# Verificar manifest
check_url "$BASE_URL/manifest.json" "manifest.json (raíz)"
check_url "$BASE_URL/public/manifest.json" "manifest.json (public)"

echo ""
echo "🎨 Verificando favicons..."

# Verificar favicons en raíz
check_url "$BASE_URL/favicons/favicon.ico" "favicon.ico"
check_url "$BASE_URL/favicons/favicon-32x32.png" "favicon-32x32.png"
check_url "$BASE_URL/favicons/favicon-180x180.png" "favicon-180x180.png"
check_url "$BASE_URL/favicons/favicon-192x192.png" "favicon-192x192.png"

# Verificar favicons en public
check_url "$BASE_URL/public/favicons/favicon.ico" "favicon.ico (public)"
check_url "$BASE_URL/public/favicons/favicon-32x32.png" "favicon-32x32.png (public)"

echo ""
echo "🏷️ Verificando logos de branding..."

# Verificar logos
check_url "$BASE_URL/public/branding/papicopilot-.png" "Logo izquierdo"
check_url "$BASE_URL/public/branding/papicopilot01.png" "Logo derecho"

echo ""
echo "📋 Verificando archivos de configuración..."

# Verificar otros archivos
check_url "$BASE_URL/robots.txt" "robots.txt"
check_url "$BASE_URL/sitemap.xml" "sitemap.xml"

echo ""
echo "📄 Verificando CSS y JS..."

# Verificar recursos CSS y JS
check_url "$BASE_URL/public/css/styles.css" "styles.css"
check_url "$BASE_URL/public/js/index_scripts.js" "index_scripts.js"

echo ""
echo "🔚 Verificación completada."
echo ""
echo "🌐 Sitio principal: $BASE_URL"
echo "🔧 Si hay fallos, verifica la configuración de GitHub Pages en:"
echo "   https://github.com/papiweb-desarrollos/papiweb/settings/pages"
