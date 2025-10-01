
# backend/pdf_generator.py - Versão Premium e Profissional
from fpdf import FPDF
from datetime import datetime
from . import models
from collections import defaultdict

class PDF(FPDF):
    def header(self):
        # Header profissional com logo
        try:
            self.image('frontend/logo.jpg', 10, 8, 30)
        except Exception as e:
            print(f"Erro ao carregar logo: {e}")

        # Título principal
        self.set_font('Arial', 'B', 20)
        self.cell(0, 15, 'RELATÓRIO FINAL DE OBRA', 0, 1, 'C')
        self.ln(25)

        # Informações de contato
        self.set_font('Arial', 'I', 9)
        self.cell(0, 8, 'Ybyoca Arquitetura & Design', 0, 1, 'C')
        self.cell(0, 5, '+55 34 9943-6350 | contato@ybyoca.com.br', 0, 1, 'C')
        self.ln(10)

        # Linha separadora
        self.set_line_width(0.5)
        self.set_draw_color(200, 200, 200)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(15)

    def footer(self):
        self.set_y(-20)
        self.set_font('Arial', 'I', 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f'Página {self.page_no()}', 0, 0, 'C')
        self.cell(0, 8, 'Documento confidencial • Gerado em ' + datetime.now().strftime("%d/%m/%Y %H:%M"), 0, 0, 'C')

def create_project_report(project: models.Project) -> bytes:
    pdf = PDF()
    pdf.add_page()

    # Informações do Projeto - Seção Premium
    pdf.set_fill_color(240, 240, 240)
    pdf.rect(10, pdf.get_y(), 190, 45, 'F')
    pdf.ln(5)

    pdf.set_font('Arial', 'B', 16)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 10, '📋 INFORMAÇÕES DO PROJETO', 0, 1, 'L')

    pdf.set_font('Arial', '', 11)
    pdf.set_text_color(60, 60, 60)
    pdf.cell(0, 7, f'Nome do Projeto: {project.name}', 0, 1, 'L')
    pdf.cell(0, 7, f'Status: {project.status}', 0, 1, 'L')

    if project.created_at:
        pdf.cell(0, 7, f'Início da Obra: {project.created_at.strftime("%d/%m/%Y")}', 0, 1, 'L')
    if project.completed_at:
        pdf.cell(0, 7, f'Conclusão: {project.completed_at.strftime("%d/%m/%Y")}', 0, 1, 'L')

    pdf.cell(0, 7, f'Data do Relatório: {datetime.now().strftime("%d/%m/%Y as %H:%M")}', 0, 1, 'L')
    pdf.ln(15)

    # Resumo Financeiro Premium
    pdf.set_fill_color(52, 168, 83)  # Verde Ybyoca
    pdf.set_text_color(255, 255, 255)
    pdf.rect(10, pdf.get_y(), 190, 35, 'F')

    pdf.set_font('Arial', 'B', 14)
    pdf.cell(0, 10, '💰 RESUMO FINANCEIRO', 0, 1, 'C')
    pdf.ln(15)

    pdf.set_font('Arial', 'B', 12)
    remaining = project.budget - project.spent

    # Cards informativos
    pdf.set_text_color(0, 0, 0)
    pdf.cell(60, 8, f'Orçamento:', 0, 0)
    pdf.cell(130, 8, f'R$ {project.budget:,.2f}', 0, 1, 'R')
    pdf.ln(6)

    pdf.cell(60, 8, f'Investido:', 0, 0)
    pdf.cell(130, 8, f'R$ {project.spent:,.2f}', 0, 1, 'R')
    pdf.ln(6)

    if remaining >= 0:
        pdf.set_text_color(34, 139, 34)
        pdf.cell(60, 8, f'Economia:', 0, 0)
        pdf.cell(130, 8, f'R$ {remaining:,.2f}', 0, 1, 'R')
    else:
        pdf.set_text_color(220, 53, 69)
        pdf.cell(60, 8, f'Estouro:', 0, 0)
        pdf.cell(130, 8, f'R$ {abs(remaining):,.2f}', 0, 1, 'R')

    pdf.ln(10)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 8, f'Percentual Utilizado: {((project.spent / project.budget) * 100):.1f}%', 0, 1, 'L')
    pdf.ln(20)

    # Estatísticas Avançadas
    if project.expenses:
        total_items = len(project.expenses)
        avg_expense = project.spent / total_items if total_items > 0 else 0

        # Cards de estatísticas
        pdf.set_font('Arial', 'B', 11)
        pdf.cell(0, 8, '📊 ESTATÍSTICAS DO PROJETO', 0, 1, 'L')
        pdf.ln(8)

        pdf.set_font('Arial', '', 10)
        pdf.cell(60, 6, f'Total de Itens:', 0, 0)
        pdf.cell(130, 6, f'{total_items} itens', 0, 1, 'R')
        pdf.ln(4)

        pdf.cell(60, 6, f'Média por Item:', 0, 0)
        pdf.cell(130, 6, f'R$ {avg_expense:.2f}', 0, 1, 'R')
        pdf.ln(10)

    # Análise de Despesas
    if not project.expenses:
        pdf.set_font('Arial', 'I', 11)
        pdf.set_text_color(128, 128, 128)
        pdf.cell(0, 10, 'Nenhuma despesa registrada para esta obra.', 0, 1, 'C')
    else:
        # Header premium da seção
        pdf.set_fill_color(100, 149, 237)  # Azul
        pdf.set_text_color(255, 255, 255)
        pdf.rect(10, pdf.get_y(), 190, 12, 'F')
        pdf.ln(5)

        pdf.set_font('Arial', 'B', 12)
        pdf.cell(0, 10, '📋 ANÁLISE DETALHADA DE INVESTIMENTOS', 0, 1, 'C')
        pdf.ln(15)

        # Agrupar despesas por categoria
        grouped_expenses = defaultdict(list)
        category_stats = {}

        for expense in project.expenses:
            grouped_expenses[expense.category].append(expense)
            if expense.category not in category_stats:
                category_stats[expense.category] = {'count': 0, 'total': 0}
            category_stats[expense.category]['count'] += 1
            category_stats[expense.category]['total'] += expense.value

        # Estatísticas por categoria
        pdf.set_text_color(0, 0, 0)
        pdf.set_font('Arial', 'B', 11)
        pdf.cell(0, 8, '📈 VISÃO POR CATEGORIA', 0, 1, 'L')
        pdf.ln(8)

        for category, stats in category_stats.items():
            percentage = (stats['total'] / project.spent * 100) if project.spent > 0 else 0
            pdf.set_font('Arial', '', 10)
            pdf.cell(100, 6, f'{category}:', 0, 0)
            pdf.cell(90, 6, f'{stats["count"]} itens ({percentage:.1f}%)', 0, 1, 'R')
            pdf.ln(4)
        pdf.ln(10)

        # Tabelas detalhadas por categoria
        for category, expenses_in_group in grouped_expenses.items():
            # Header da categoria
            pdf.set_fill_color(244, 244, 244)
            pdf.rect(10, pdf.get_y(), 190, 10, 'F')
            pdf.ln(2)

            pdf.set_font('Arial', 'B', 11)
            pdf.set_text_color(0, 0, 0)
            pdf.cell(0, 8, f'📂 {category.upper()} - {len(expenses_in_group)} itens', 0, 1, 'L')
            pdf.ln(8)

            # Cabeçalho da tabela
            pdf.set_font('Arial', 'B', 9)
            pdf.set_fill_color(220, 220, 220)
            pdf.cell(5, 8, '#', 1, 0, 'C')
            pdf.cell(110, 8, 'Descrição', 1, 0, 'C')
            pdf.cell(40, 8, 'Valor', 1, 0, 'C')
            pdf.cell(35, 8, 'Data', 1, 0, 'C')
            pdf.ln(6)

            # Itens da tabela
            pdf.set_text_color(0, 0, 0)
            category_subtotal = 0
            for i, expense in enumerate(expenses_in_group):
                # Alternar cores das linhas
                if i % 2 == 0:
                    pdf.set_fill_color(249, 249, 249)
                    pdf.rect(10, pdf.get_y(), 190, 6, 'F')
                    pdf.set_text_color(0, 0, 0)
                else:
                    pdf.set_fill_color(255, 255, 255)
                    pdf.set_text_color(0, 0, 0)

                pdf.set_font('Arial', '', 9)

                # Tratamento do texto para evitar erros de codificação
                item_name = str(expense.name).encode('latin-1', 'replace').decode('latin-1')
                if len(item_name) > 40:
                    item_name = item_name[:37] + '...'

                pdf.cell(5, 6, str(i + 1), 1, 0, 'C')
                pdf.cell(110, 6, item_name, 1, 0, 'L')
                pdf.cell(40, 6, f'R$ {expense.value:,.2f}', 1, 0, 'R')
                pdf.cell(35, 6, expense.created_at.strftime("%d/%m/%Y") if expense.created_at else 'N/A', 1, 0, 'C')
                pdf.ln(6)

                category_subtotal += expense.value

            # Subtotal da categoria
            pdf.set_fill_color(230, 230, 250)
            pdf.rect(10, pdf.get_y(), 190, 8, 'F')
            pdf.ln(2)

            pdf.set_font('Arial', 'B', 10)
            pdf.set_text_color(0, 0, 0)
            pdf.cell(115, 8, f'SUBTOTAL {category.upper()}:', 0, 0, 'L')
            pdf.cell(75, 8, f'R$ {category_subtotal:,.2f}', 0, 1, 'R')
            pdf.ln(12)

    # Conclusão do Relatório
    pdf.ln(10)
    pdf.set_fill_color(52, 168, 83)
    pdf.set_text_color(255, 255, 255)
    pdf.rect(10, pdf.get_y(), 190, 15, 'F')
    pdf.ln(5)

    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, '✅ RELATÓRIO CONCLUÍDO COM SUCESSO', 0, 1, 'C')
    pdf.ln(10)

    pdf.set_text_color(0, 0, 0)
    pdf.set_font('Arial', 'I', 10)
    pdf.multi_cell(0, 6, f'O presente relatório foi gerado pelo sistema Ybyoca Enterprise em {datetime.now().strftime("%d/%m/%Y as %H:%M")}, contendo todas as informações financeiras e detalhes do projeto "{project.name}".\n\nPara dúvidas ou esclarecimentos, entre em contato através do WhatsApp +55 34 9943-6350 ou email contato@ybyoca.com.br.')

    # Gera o PDF em memória e retorna como bytes
    return pdf.output(dest='S').encode('latin-1')
