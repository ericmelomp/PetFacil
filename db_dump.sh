# Cores ANSI para output colorido
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          🗄️  INICIANDO BACKUP DO BANCO DE DADOS        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📤 Extraindo dados do banco de origem...${NC}"
echo -e "   Host: 192.168.15.10:5432"
echo -e "   Database: petshop_db"
PGPASSWORD="petshop123" pg_dump -h 192.168.15.10 -p 5432 -U petshop -d petshop_db -F c -f db.dump
DUMP_STATUS=$?

if [ $DUMP_STATUS -eq 0 ]; then
    echo -e "${GREEN}✅ Dump criado com sucesso: db.dump${NC}"
else
    echo -e "${RED}❌ Erro ao criar o dump do banco de dados!${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        🔄 RESTAURANDO BANCO DE DADOS                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}ℹ️  O script executará a restauração 2 vezes automaticamente${NC}"
echo -e "${CYAN}   (É normal que a primeira execução apresente erros)${NC}"
echo ""

# Executa a restauração 2 vezes
for i in 1 2; do
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}📥 Tentativa $i de 2 - Restaurando dados no banco de destino...${NC}"
    echo -e "   Host: 192.168.15.10:5433"
    echo -e "   Database: petshop_db"
    
    if [ $i -eq 1 ]; then
        echo -e "${CYAN}   (Avisos/erros nesta primeira tentativa são esperados)${NC}"
    else
        echo -e "${CYAN}   (Segunda tentativa - deve completar com sucesso)${NC}"
    fi
    
    PGPASSWORD="petshop123" pg_restore -h 192.168.15.10 -p 5433 -U petshop -d petshop_db -c db.dump 2>&1
    RESTORE_STATUS=$?
    
    if [ $RESTORE_STATUS -eq 0 ]; then
        echo -e "${GREEN}✅ Restauração $i concluída com sucesso!${NC}"
        if [ $i -eq 1 ]; then
            echo -e "${CYAN}💡 Primeira tentativa bem-sucedida! Continuando com a segunda...${NC}"
        fi
    else
        if [ $i -eq 1 ]; then
            echo -e "${YELLOW}⚠️  Primeira tentativa apresentou erros (isso é esperado)${NC}"
            echo -e "${CYAN}   Continuando com a segunda tentativa...${NC}"
        else
            echo -e "${RED}❌ Segunda tentativa também apresentou erros${NC}"
        fi
    fi
done

echo ""
echo -e "${YELLOW}🧹 Removendo arquivo temporário...${NC}"
rm -f db.dump
echo -e "${GREEN}✅ Arquivo removido${NC}"
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✨ PROCESSO CONCLUÍDO!                     ║${NC}"
echo -e "${GREEN}║     (Restauração executada 2 vezes conforme esperado)   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"