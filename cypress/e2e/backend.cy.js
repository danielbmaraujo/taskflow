/// <reference types="cypress" />

const API = 'http://localhost:3001/api';

describe('TaskFlow API — Testes de Backend', () => {

  beforeEach(() => {
    cy.request('POST', `${API}/reset`);
  });

  // ── Health ──────────────────────────────────────────────
  context('Health Check', () => {
    it('deve retornar status 200 e mensagem de saúde', () => {
      cy.request(`${API}/health`).then(res => {
        expect(res.status).to.eq(200);
        expect(res.body.success).to.be.true;
        expect(res.body.message).to.include('running');
      });
    });
  });

  // ── GET /tasks ──────────────────────────────────────────
  context('GET /api/tasks', () => {
    it('deve retornar lista vazia inicialmente', () => {
      cy.request(`${API}/tasks`).then(res => {
        expect(res.status).to.eq(200);
        expect(res.body.success).to.be.true;
        expect(res.body.data).to.deep.equal([]);
      });
    });

    it('deve retornar todas as tarefas criadas', () => {
      cy.request('POST', `${API}/tasks`, { title: 'Tarefa A' });
      cy.request('POST', `${API}/tasks`, { title: 'Tarefa B' });

      cy.request(`${API}/tasks`).then(res => {
        expect(res.status).to.eq(200);
        expect(res.body.data).to.have.length(2);
      });
    });
  });

  // ── POST /tasks ─────────────────────────────────────────
  context('POST /api/tasks', () => {
    it('deve criar tarefa com título válido', () => {
      cy.request('POST', `${API}/tasks`, {
        title: 'Estudar Cypress',
        description: 'Aprender testes E2E'
      }).then(res => {
        expect(res.status).to.eq(201);
        expect(res.body.success).to.be.true;
        expect(res.body.data.title).to.eq('Estudar Cypress');
        expect(res.body.data.description).to.eq('Aprender testes E2E');
        expect(res.body.data.completed).to.be.false;
        expect(res.body.data.id).to.be.a('number');
        expect(res.body.data.createdAt).to.be.a('string');
      });
    });

    it('deve criar tarefa somente com título (sem descrição)', () => {
      cy.request('POST', `${API}/tasks`, { title: 'Apenas título' }).then(res => {
        expect(res.status).to.eq(201);
        expect(res.body.data.title).to.eq('Apenas título');
        expect(res.body.data.description).to.eq('');
      });
    });

    it('deve retornar 400 quando título está vazio', () => {
      cy.request({
        method: 'POST',
        url: `${API}/tasks`,
        body: { title: '' },
        failOnStatusCode: false
      }).then(res => {
        expect(res.status).to.eq(400);
        expect(res.body.success).to.be.false;
        expect(res.body.message).to.include('required');
      });
    });

    it('deve retornar 400 quando título é apenas espaços', () => {
      cy.request({
        method: 'POST',
        url: `${API}/tasks`,
        body: { title: '   ' },
        failOnStatusCode: false
      }).then(res => {
        expect(res.status).to.eq(400);
        expect(res.body.success).to.be.false;
      });
    });

    it('deve retornar 400 quando título não é enviado', () => {
      cy.request({
        method: 'POST',
        url: `${API}/tasks`,
        body: {},
        failOnStatusCode: false
      }).then(res => {
        expect(res.status).to.eq(400);
        expect(res.body.success).to.be.false;
      });
    });

    it('deve remover espaços extras do título', () => {
      cy.request('POST', `${API}/tasks`, { title: '  Tarefa com espaços  ' }).then(res => {
        expect(res.body.data.title).to.eq('Tarefa com espaços');
      });
    });
  });

  // ── GET /tasks/:id ──────────────────────────────────────
  context('GET /api/tasks/:id', () => {
    it('deve buscar tarefa por ID', () => {
      cy.request('POST', `${API}/tasks`, { title: 'Buscar por ID' }).then(create => {
        const id = create.body.data.id;
        cy.request(`${API}/tasks/${id}`).then(res => {
          expect(res.status).to.eq(200);
          expect(res.body.data.id).to.eq(id);
          expect(res.body.data.title).to.eq('Buscar por ID');
        });
      });
    });

    it('deve retornar 404 para ID inexistente', () => {
      cy.request({ url: `${API}/tasks/99999`, failOnStatusCode: false }).then(res => {
        expect(res.status).to.eq(404);
        expect(res.body.success).to.be.false;
        expect(res.body.message).to.include('not found');
      });
    });
  });

  // ── PUT /tasks/:id ──────────────────────────────────────
  context('PUT /api/tasks/:id', () => {
    it('deve marcar tarefa como concluída', () => {
      cy.request('POST', `${API}/tasks`, { title: 'Completar' }).then(create => {
        const id = create.body.data.id;
        cy.request('PUT', `${API}/tasks/${id}`, { completed: true }).then(res => {
          expect(res.status).to.eq(200);
          expect(res.body.data.completed).to.be.true;
          expect(res.body.data.updatedAt).to.be.a('string');
        });
      });
    });

    it('deve atualizar o título da tarefa', () => {
      cy.request('POST', `${API}/tasks`, { title: 'Original' }).then(create => {
        const id = create.body.data.id;
        cy.request('PUT', `${API}/tasks/${id}`, { title: 'Atualizado' }).then(res => {
          expect(res.status).to.eq(200);
          expect(res.body.data.title).to.eq('Atualizado');
        });
      });
    });

    it('deve retornar 400 ao atualizar com título vazio', () => {
      cy.request('POST', `${API}/tasks`, { title: 'Não apagar' }).then(create => {
        const id = create.body.data.id;
        cy.request({
          method: 'PUT',
          url: `${API}/tasks/${id}`,
          body: { title: '' },
          failOnStatusCode: false
        }).then(res => {
          expect(res.status).to.eq(400);
          expect(res.body.success).to.be.false;
        });
      });
    });

    it('deve retornar 404 para ID inexistente', () => {
      cy.request({
        method: 'PUT',
        url: `${API}/tasks/99999`,
        body: { completed: true },
        failOnStatusCode: false
      }).then(res => {
        expect(res.status).to.eq(404);
      });
    });
  });

  // ── DELETE /tasks/:id ───────────────────────────────────
  context('DELETE /api/tasks/:id', () => {
    it('deve deletar tarefa existente', () => {
      cy.request('POST', `${API}/tasks`, { title: 'Para deletar' }).then(create => {
        const id = create.body.data.id;
        cy.request('DELETE', `${API}/tasks/${id}`).then(res => {
          expect(res.status).to.eq(200);
          expect(res.body.success).to.be.true;
        });

        // Confirma que sumiu
        cy.request({ url: `${API}/tasks/${id}`, failOnStatusCode: false }).then(check => {
          expect(check.status).to.eq(404);
        });
      });
    });

    it('deve retornar 404 ao deletar ID inexistente', () => {
      cy.request({
        method: 'DELETE',
        url: `${API}/tasks/99999`,
        failOnStatusCode: false
      }).then(res => {
        expect(res.status).to.eq(404);
        expect(res.body.success).to.be.false;
      });
    });
  });

  // ── Fluxo completo ──────────────────────────────────────
  context('Fluxo CRUD completo', () => {
    it('deve executar o ciclo completo: criar → ler → atualizar → deletar', () => {
      let taskId;

      // Criar
      cy.request('POST', `${API}/tasks`, {
        title: 'Tarefa CRUD',
        description: 'Testando fluxo completo'
      }).then(res => {
        expect(res.status).to.eq(201);
        taskId = res.body.data.id;

        // Ler
        return cy.request(`${API}/tasks/${taskId}`);
      }).then(res => {
        expect(res.body.data.title).to.eq('Tarefa CRUD');

        // Atualizar
        return cy.request('PUT', `${API}/tasks/${taskId}`, {
          title: 'Tarefa CRUD atualizada',
          completed: true
        });
      }).then(res => {
        expect(res.body.data.title).to.eq('Tarefa CRUD atualizada');
        expect(res.body.data.completed).to.be.true;

        // Deletar
        return cy.request('DELETE', `${API}/tasks/${taskId}`);
      }).then(res => {
        expect(res.status).to.eq(200);
      });
    });
  });
});
