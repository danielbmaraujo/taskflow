/// <reference types="cypress" />

const FRONTEND_URL = 'http://localhost:8080';
const API = 'http://localhost:3001/api';

describe('TaskFlow Frontend — Testes de Interface', () => {

  beforeEach(() => {
    cy.request('POST', `${API}/reset`);
    cy.visit(FRONTEND_URL);
    cy.get('#task-list', { timeout: 8000 }).should('exist');
    // Aguarda o loading desaparecer
    cy.get('#loading-msg', { timeout: 5000 }).should('not.exist');
  });

  // ── Layout e Elementos ──────────────────────────────────
  context('Layout e Elementos da Página', () => {
    it('deve exibir o título TaskFlow', () => {
      cy.contains('TaskFlow').should('be.visible');
    });

    it('deve exibir o formulário de nova tarefa', () => {
      cy.get('[data-testid="task-title-input"]').should('be.visible');
      cy.get('[data-testid="task-desc-input"]').should('be.visible');
      cy.get('[data-testid="add-task-btn"]').should('be.visible');
    });

    it('deve exibir os filtros', () => {
      cy.get('[data-testid="filter-all"]').should('be.visible');
      cy.get('[data-testid="filter-pending"]').should('be.visible');
      cy.get('[data-testid="filter-completed"]').should('be.visible');
    });

    it('deve exibir estatísticas zeradas', () => {
      cy.get('#stat-total').should('have.text', '0');
      cy.get('#stat-done').should('have.text', '0');
      cy.get('#stat-pending').should('have.text', '0');
    });

    it('deve exibir estado vazio quando não há tarefas', () => {
      cy.get('[data-testid="empty-state"]').should('be.visible');
    });
  });

  // ── Criar Tarefas ───────────────────────────────────────
  context('Criar Tarefas', () => {
    it('deve criar uma tarefa com título', () => {
      cy.get('[data-testid="task-title-input"]').type('Minha primeira tarefa');
      cy.get('[data-testid="add-task-btn"]').click();
      cy.get('[data-testid="task-item"]').should('have.length', 1);
      cy.contains('Minha primeira tarefa').should('be.visible');
    });

    it('deve criar tarefa com título e descrição', () => {
      cy.get('[data-testid="task-title-input"]').type('Com descrição');
      cy.get('[data-testid="task-desc-input"]').type('Detalhes aqui');
      cy.get('[data-testid="add-task-btn"]').click();
      cy.contains('Com descrição').should('be.visible');
      cy.contains('Detalhes aqui').should('be.visible');
    });

    it('deve limpar os campos após criar tarefa', () => {
      cy.get('[data-testid="task-title-input"]').type('Limpar campos');
      cy.get('[data-testid="task-desc-input"]').type('Descrição');
      cy.get('[data-testid="add-task-btn"]').click();
      cy.get('[data-testid="task-title-input"]').should('have.value', '');
      cy.get('[data-testid="task-desc-input"]').should('have.value', '');
    });

    it('deve criar tarefa ao pressionar Enter no campo título', () => {
      cy.get('[data-testid="task-title-input"]').type('Enter cria tarefa{enter}');
      cy.get('[data-testid="task-item"]').should('have.length', 1);
    });

    it('não deve criar tarefa sem título', () => {
      cy.get('[data-testid="add-task-btn"]').click();
      cy.get('[data-testid="task-item"]').should('not.exist');
      cy.get('#form-error').should('be.visible');
    });

    it('deve criar múltiplas tarefas', () => {
      const tasks = ['Tarefa Alpha', 'Tarefa Beta', 'Tarefa Gamma'];
      tasks.forEach(t => {
        cy.get('[data-testid="task-title-input"]').type(t);
        cy.get('[data-testid="add-task-btn"]').click();
      });
      cy.get('[data-testid="task-item"]').should('have.length', 3);
    });

    it('deve atualizar estatísticas ao criar tarefas', () => {
      cy.get('[data-testid="task-title-input"]').type('Contar esta');
      cy.get('[data-testid="add-task-btn"]').click();
      cy.get('#stat-total').should('have.text', '1');
      cy.get('#stat-pending').should('have.text', '1');
      cy.get('#stat-done').should('have.text', '0');
    });
  });

  // ── Concluir Tarefas ────────────────────────────────────
  context('Concluir Tarefas', () => {
    beforeEach(() => {
      cy.request('POST', `${API}/tasks`, { title: 'Tarefa para concluir' });
      cy.reload();
      cy.get('[data-testid="task-item"]', { timeout: 6000 }).should('have.length', 1);
    });

    it('deve marcar tarefa como concluída ao clicar no checkbox', () => {
      cy.get('[data-testid="task-item"]').first().then($item => {
        const id = $item.attr('data-id');
        cy.get(`[data-testid="task-toggle-${id}"]`).click();
        cy.get('[data-testid="task-item"]').first().should('have.class', 'completed');
      });
    });

    it('deve atualizar estatísticas ao concluir tarefa', () => {
      cy.get('[data-testid="task-item"]').first().then($item => {
        const id = $item.attr('data-id');
        cy.get(`[data-testid="task-toggle-${id}"]`).click();
      });
      cy.get('#stat-done').should('have.text', '1');
      cy.get('#stat-pending').should('have.text', '0');
    });
  });

  // ── Deletar Tarefas ─────────────────────────────────────
  context('Deletar Tarefas', () => {
    beforeEach(() => {
      cy.request('POST', `${API}/tasks`, { title: 'Tarefa para deletar' });
      cy.reload();
      cy.get('[data-testid="task-item"]', { timeout: 6000 }).should('have.length', 1);
    });

    it('deve remover tarefa ao clicar no botão deletar', () => {
      cy.get('[data-testid="task-item"]').first().then($item => {
        const id = $item.attr('data-id');
        cy.get(`[data-testid="task-delete-${id}"]`).click();
      });
      cy.get('[data-testid="task-item"]').should('not.exist');
      cy.get('[data-testid="empty-state"]').should('be.visible');
    });

    it('deve atualizar estatísticas após deletar', () => {
      cy.get('[data-testid="task-item"]').first().then($item => {
        const id = $item.attr('data-id');
        cy.get(`[data-testid="task-delete-${id}"]`).click();
      });
      cy.get('#stat-total').should('have.text', '0');
    });
  });

  // ── Filtros ─────────────────────────────────────────────
  context('Filtros de Tarefas', () => {
    beforeEach(() => {
      cy.request('POST', `${API}/tasks`, { title: 'Tarefa pendente' });
      cy.request('POST', `${API}/tasks`, { title: 'Tarefa concluída' }).then(res => {
        cy.request('PUT', `${API}/tasks/${res.body.data.id}`, { completed: true });
      });
      cy.reload();
      cy.get('[data-testid="task-item"]', { timeout: 6000 }).should('have.length', 2);
    });

    it('deve mostrar todas as tarefas no filtro "Todas"', () => {
      cy.get('[data-testid="filter-all"]').click();
      cy.get('[data-testid="task-item"]').should('have.length', 2);
    });

    it('deve mostrar apenas pendentes no filtro "Pendentes"', () => {
      cy.get('[data-testid="filter-pending"]').click();
      cy.get('[data-testid="task-item"]').should('have.length', 1);
      cy.contains('Tarefa pendente').should('be.visible');
    });

    it('deve mostrar apenas concluídas no filtro "Concluídas"', () => {
      cy.get('[data-testid="filter-completed"]').click();
      cy.get('[data-testid="task-item"]').should('have.length', 1);
      cy.contains('Tarefa concluída').should('be.visible');
    });

    it('deve ativar o botão de filtro selecionado', () => {
      cy.get('[data-testid="filter-pending"]').click();
      cy.get('[data-testid="filter-pending"]').should('have.class', 'active');
      cy.get('[data-testid="filter-all"]').should('not.have.class', 'active');
    });
  });
});
