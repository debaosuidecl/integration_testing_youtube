const express = require('express'); // import express
const bookRoute = require('../routes/books.route'); //import file we are testing
const request = require('supertest'); // supertest is a framework that allows to easily test web apis
const app = express(); //an instance of an express app, a 'fake' express app
app.use(express.json());

app.use('/books', bookRoute); //routes

describe('Integration tests for the books API', () => {
	it('GET /books - success', async () => {
		const { body, statusCode } = await request(app).get('/books'); //uses the request function that calls on express app instance
		expect(body).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: expect.any(Number),
					name: expect.any(String),
					author: expect.any(String)
				})
			])
		);
		expect(statusCode).toBe(200);
	});

	it('POST /books - success', async () => {
		const { body, statusCode } = await request(app).post('/books').send({
			name: "Lion's dream",
			author: 'Julie England'
		});

		expect(statusCode).toBe(200);
		expect(body).toEqual({
			message: 'Success'
		});
	});

	it('POST /books - failure on invalid post body without name property', async () => {
		const { body, statusCode } = await request(app).post('/books').send({
			// name: "Lion's dream"
			author: 'Julie England'
		});

		expect(statusCode).toBe(400);
		expect(body).toEqual({
			errors: [
				{
					location: 'body',
					msg: 'Book name is required',
					param: 'name'
				}
			]
		});
	});

	// WRITE UPDATE FAILURES FIRST

	it('PUT /:bookid - failure on book not found', async () => {
		const { body, statusCode } = await request(app).put('/books/50').send({
			name: "Lion's dream",
			author: 'Julie England'
		});

		expect(statusCode).toBe(404);
		expect(body).toEqual({
			error: true,
			message: 'Book not found'
		});
	});

	it('PUT /:bookid - failure invalid params', async () => {
		const { body, statusCode } = await request(app).put('/books/3').send({
			name: '',
			author: ''
		});
		expect(statusCode).toBe(400);
		expect(body).toEqual({
			errors: [
				{
					location: 'body',
					msg: 'Book name is required',
					param: 'name',
					value: ''
				},
				{
					location: 'body',
					msg: 'Author name is required',
					param: 'author',
					value: ''
				}
			]
		});
	});
	it('PUT /:bookid - success - updated book by id', async () => {
		const { body, statusCode } = await request(app).put(`/books/3`).send({
			name: 'Nightmares',
			author: 'Jamie Wilde'
		});

		expect(statusCode).toBe(200);
		expect(body).toEqual({
			name: 'Nightmares',
			author: 'Jamie Wilde',
			id: 3
		});
	});

	it('DELETE /:bookid - failure on book not found', async () => {
		const { body, statusCode } = await request(app).delete('/books/50');

		expect(statusCode).toBe(404);
		expect(body).toEqual({
			error: true,
			message: 'Book not found'
		});
	});

	it('DELETE /:bookid - success - on delete book successfully', async () => {
		const { body, statusCode } = await request(app).delete('/books/2');
		expect(statusCode).toBe(200);
		expect(body).toEqual({
			message: 'Success'
		});
	});
});
