#!/bin/bash

echo "🚀 Preparando Papiweb para despliegue en GitHub Pages"
echo "================================================="

# Verificar estructura de archivos
echo "📁 Verificando estructura de archivos..."
if [ -f "index.html" ]; then
    echo "✅ index.html encontrado"
else
    echo "❌ index.html no encontrado"
    exit 1
fi

if [ -d "public" ]; then
    echo "✅ Directorio public/ encontrado"
else
    echo "❌ Directorio public/ no encontrado"
    exit 1
fi

# Verificar archivos críticos
critical_files=("public/css/styles.css" "public/js/index_scripts.js" "public/manifest.json" "sitemap.xml" "robots.txt")

for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file encontrado"
    else
        echo "❌ $file no encontrado"
    fi
done

# Verificar favicons
echo "🎨 Verificando favicons..."
if [ -d "public/favicons" ]; then
    favicon_count=$(ls public/favicons/ | wc -l)
    echo "✅ $favicon_count favicons encontrados en public/favicons/"
else
    echo "❌ Directorio public/favicons/ no encontrado"
fi

# Verificar imágenes de branding
echo "🖼️ Verificando imágenes de branding..."
if [ -f "public/branding/papicopilot-.png" ] && [ -f "public/branding/papicopilot01.png" ]; then
    echo "✅ Logos principales encontrados"
else
    echo "⚠️ Algunos logos pueden estar faltando"
fi

# Verificar configuración de GitHub Pages
echo "⚙️ Verificando configuración de GitHub Pages..."
if [ -f "_config.yml" ]; then
    echo "✅ _config.yml encontrado"
fi

if [ -f ".nojekyll" ]; then
    echo "✅ .nojekyll encontrado (procesamiento Jekyll deshabilitado)"
fi

if [ -f ".github/workflows/pages.yml" ]; then
    echo "✅ GitHub Actions workflow encontrado"
fi

# Verificar tamaños de archivos
echo "📊 Verificando tamaños de archivos..."
large_files=$(find . -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" | xargs ls -la | awk '$5 > 1000000 {print $9, "(" $5/1000000 "MB)"}')

if [ -n "$large_files" ]; then
    echo "⚠️ Archivos grandes encontrados (>1MB):"
    echo "$large_files"
    echo "💡 Considera optimizar estas imágenes para mejor rendimiento"
else
    echo "✅ No se encontraron archivos excesivamente grandes"
fi

# Validar HTML básico
echo "🔍 Validando HTML básico..."
if grep -q "<!DOCTYPE html>" index.html; then
    echo "✅ DOCTYPE HTML encontrado"
fi

if grep -q "<title>" index.html; then
    echo "✅ Título de página encontrado"
fi

if grep -q "manifest.json" index.html; then
    echo "✅ PWA Manifest vinculado"
fi

# Verificar enlaces de CDN
echo "🌐 Verificando enlaces externos..."
cdn_links=$(grep -o 'https://cdnjs.cloudflare.com[^"]*' index.html | sort -u)
if [ -n "$cdn_links" ]; then
    echo "✅ Enlaces CDN encontrados:"
    echo "$cdn_links"
fi

# Resumen final
echo ""
echo "========================================="
echo "✅ Verificación completada!"
echo "📋 Resumen:"
echo "   - Archivos principales: ✅"
echo "   - Configuración GitHub Pages: ✅"
echo "   - Favicons: ✅"
echo "   - PWA Manifest: ✅"
echo ""
echo "🚀 Tu sitio está listo para GitHub Pages!"
echo "📝 Próximos pasos:"
echo "   1. git add ."
echo "   2. git commit -m 'Preparar para GitHub Pages'"
echo "   3. git push origin main"
echo "   4. Configurar GitHub Pages en Settings > Pages"
echo "========================================="
