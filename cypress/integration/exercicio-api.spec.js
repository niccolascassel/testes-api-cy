/// <reference types="cypress" />
const { faker } = require('@faker-js/faker');
import contrato from '../contracts/usuarios.contract'

describe('Testes da Funcionalidade Usuários', () => {

     let token
     let firstName = faker.name.firstName()
     let lastName = faker.name.lastName()
     let email = faker.internet.email(firstName, lastName)
     let lastCreatedId

     before(() => {
          cy.token('niccolas.cassel@teste.com.br', '123456').then(tkn => { token = tkn })
     });

     it('Deve validar contrato de usuários', () => {
          cy.request('usuarios').then(response => {
               return contrato.validateAsync(response.body)
          })
     });

     it('Deve listar usuários cadastrados', () => {
          cy.request({
               method: 'GET',
               url: 'usuarios'
          }).then((response) => {
               expect(response.status).to.equal(200)
               expect(response.body).to.have.property('usuarios')
               expect(response.duration).to.be.lessThan(20)
          })
     });

     it('Deve cadastrar um usuário com sucesso', () => {

          cy.cadastrarUsuario(
               token,
               `${firstName} ${lastName}`,
               email,
               "teste@teste.com",
               "true"
          ).then((response) => {
               expect(response.status).to.equal(201)
               expect(response.body.message).to.equal('Cadastro realizado com sucesso')

               lastCreatedId = response.body._id
          })
     });

     it('Deve validar um usuário com email inválido', () => {

          cy.cadastrarUsuario(
               token,
               `${firstName} ${lastName}`,
               email,
               "teste@teste.com",
               "true"
          ).then((response) => {
               expect(response.status).to.equal(400)
               expect(response.body.message).to.equal('Este email já está sendo usado')
          })
     });

     it('Deve editar um usuário previamente cadastrado', () => {

          cy.request({
               method: 'PUT',
               url: `usuarios/${lastCreatedId}`,
               headers: { authorization: token },
               body:
               {
                    "nome": `${firstName} ${lastName}`,
                    "email": faker.internet.email(lastName, firstName),
                    "password": "teste@teste.com",
                    "administrador": "true"
               }
          }).then(response => {
               expect(response.body.message).to.equal('Registro alterado com sucesso')
          })
     });

     it('Deve deletar um usuário previamente cadastrado', () => {
          
          cy.request({
               method: 'DELETE',
               url: `usuarios/${lastCreatedId}`,
               headers: { authorization: token }
          }).then(response => {
               expect(response.body.message).to.equal('Registro excluído com sucesso')
          })
     });


});
