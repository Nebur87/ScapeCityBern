#!/bin/bash

# ScapeArBern - Production Deployment Script
# Automatiza el despliegue del backend con Docker Compose

set -e  # Detener el script si ocurre un error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar ayuda
show_help() {
    echo -e "${BLUE}📚 ScapeArBern - Deployment Script${NC}"
    echo -e "Uso: ./deploy.sh [COMANDO]"
    echo ""
    echo -e "Comandos disponibles:"
    echo -e "  ${GREEN}build${NC}    - Construir las imágenes Docker"
    echo -e "  ${GREEN}up${NC}       - Levantar servicios en producción"
    echo -e "  ${GREEN}logs${NC}     - Ver logs del backend en tiempo real"
    echo -e "  ${GREEN}restart${NC}  - Reiniciar todos los servicios"
    echo -e "  ${GREEN}down${NC}     - Parar y remover todos los servicios"
    echo -e "  ${GREEN}status${NC}   - Ver estado de los servicios"
    echo -e "  ${GREEN}help${NC}     - Mostrar esta ayuda"
    echo ""
    echo -e "Ejemplo: ${YELLOW}./deploy.sh up${NC}"
}

# Función para verificar dependencias
check_dependencies() {
    echo -e "${BLUE}🔍 Verificando dependencias...${NC}"
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker no está instalado${NC}"
        echo -e "${YELLOW}💡 Instala Docker: https://docs.docker.com/get-docker/${NC}"
        exit 1
    fi
    
    # Verificar Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        echo -e "${RED}❌ Docker Compose no está instalado${NC}"
        echo -e "${YELLOW}💡 Instala Docker Compose: https://docs.docker.com/compose/install/${NC}"
        exit 1
    fi
    
    # Verificar archivo docker-compose.prod.yml
    if [ ! -f "docker-compose.prod.yml" ]; then
        echo -e "${RED}❌ Archivo docker-compose.prod.yml no encontrado${NC}"
        echo -e "${YELLOW}💡 Asegúrate de que el archivo esté en el directorio actual${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Todas las dependencias están disponibles${NC}"
}

# Función para cargar variables de entorno
load_env() {
    if [ -f ".env" ]; then
        echo -e "${BLUE}📝 Cargando variables de entorno desde .env${NC}"
        export $(grep -v '^#' .env | xargs)
        echo -e "${GREEN}✅ Variables de entorno cargadas${NC}"
    else
        echo -e "${YELLOW}⚠️  Archivo .env no encontrado, usando variables por defecto${NC}"
    fi
}

# Función para construir imágenes
build_images() {
    echo -e "${BLUE}🔨 Construyendo imágenes Docker...${NC}"
    docker compose -f docker-compose.prod.yml build
    echo -e "${GREEN}✅ Imágenes construidas exitosamente${NC}"
}

# Función para levantar servicios
start_services() {
    echo -e "${BLUE}🚀 Levantando servicios en producción...${NC}"
    docker compose -f docker-compose.prod.yml up -d
    
    echo -e "${GREEN}✅ Servicios levantados exitosamente${NC}"
    echo -e "${BLUE}📊 Estado de los servicios:${NC}"
    docker compose -f docker-compose.prod.yml ps
    
    echo ""
    echo -e "${GREEN}🎉 Backend levantado en producción${NC}"
    echo -e "${YELLOW}💡 Usa './deploy.sh logs' para ver logs en tiempo real${NC}"
}

# Función para ver logs
show_logs() {
    echo -e "${BLUE}📋 Mostrando logs del backend...${NC}"
    echo -e "${YELLOW}💡 Presiona Ctrl+C para salir${NC}"
    docker compose -f docker-compose.prod.yml logs -f backend
}

# Función para reiniciar servicios
restart_services() {
    echo -e "${BLUE}🔄 Reiniciando servicios...${NC}"
    docker compose -f docker-compose.prod.yml restart
    echo -e "${GREEN}✅ Servicios reiniciados exitosamente${NC}"
    
    echo -e "${BLUE}📊 Estado de los servicios:${NC}"
    docker compose -f docker-compose.prod.yml ps
}

# Función para parar servicios
stop_services() {
    echo -e "${BLUE}⏹️  Parando servicios...${NC}"
    docker compose -f docker-compose.prod.yml down
    echo -e "${GREEN}✅ Servicios parados y removidos${NC}"
}

# Función para mostrar estado
show_status() {
    echo -e "${BLUE}📊 Estado actual de los servicios:${NC}"
    docker compose -f docker-compose.prod.yml ps
    
    echo ""
    echo -e "${BLUE}💾 Uso de recursos:${NC}"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" \
        $(docker compose -f docker-compose.prod.yml ps -q) 2>/dev/null || echo "No hay contenedores ejecutándose"
}

# Función principal
main() {
    # Mostrar banner
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════╗"
    echo "║         🐻 ScapeArBern 🐻            ║"
    echo "║      Production Deployment           ║"
    echo "╚══════════════════════════════════════╝"
    echo -e "${NC}"
    
    # Verificar dependencias al inicio (excepto para help)
    if [ "$1" != "help" ] && [ "$1" != "--help" ] && [ "$1" != "-h" ]; then
        check_dependencies
        load_env
    fi
    
    # Procesar comando
    case "$1" in
        "build")
            build_images
            ;;
        "up")
            start_services
            ;;
        "logs")
            show_logs
            ;;
        "restart")
            restart_services
            ;;
        "down")
            stop_services
            ;;
        "status")
            show_status
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        "")
            echo -e "${YELLOW}⚠️  No se especificó ningún comando${NC}"
            show_help
            exit 1
            ;;
        *)
            echo -e "${RED}❌ Comando desconocido: $1${NC}"
            show_help
            exit 1
            ;;
    esac
}

# Ejecutar función principal con todos los argumentos
main "$@"