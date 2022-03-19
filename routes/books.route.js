const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const { save } = require('../services/book.service');
const bookData = require('../data/books.json');
// get Book List

router.get('/', (req, res) => {
	res.json(bookData);
});

// @POST - creates a new book
// @SCHEMA - {author: String, name: String}
router.post(
	'/',
	[
		check('name', 'Book name is required').not().isEmpty(),
		check('author', 'Author name is required').not().isEmpty()
	],
	(req, res) => {
		// test failure first
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const { name, author } = req.body;

		bookData.push({
			name,
			author,
			id: Math.random()
		});
		const isSaved = save(bookData);
		if (!isSaved) {
			return res.status(400).json({
				errors: {
					location: 'db',
					param: '',
					message: 'Could not save book'
				}
			});
		}

		res.status(200).json({
			message: 'Success'
		});
	}
);

router.put(
	'/:bookid',
	[
		check('name', 'Book name is required').not().isEmpty(),
		check('author', 'Author name is required').not().isEmpty()
	],
	(req, res) => {
		// test failure first
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		// res.json('done');

		const { bookid } = req.params;
		const { name, author } = req.body;

		const book = bookData.find((book) => book.id == bookid);

		if (!book) {
			return res.status(404).send({
				error: true,
				message: 'Book not found'
			});
		}

		let updatedBook = null;

		const updatedBooks = bookData.map((book) => {
			if (book.id == bookid) {
				updatedBook = {
					...book,
					name,
					author
				};
				return updatedBook;
			}
			return book;
		});
		const isSaved = save(updatedBooks);
		if (!isSaved) {
			return res.status(400).json({
				errors: {
					location: 'db',
					param: '',
					message: 'Could not save book'
				}
			});
		}

		res.json(updatedBook);
	}
);

router.delete('/:bookid', (req, res) => {
	const { bookid } = req.params;

	const book = bookData.find((book) => book.id == bookid);

	if (!book) {
		return res.status(404).send({
			error: true,
			message: 'Book not found'
		});
	}

	const updatedBooks = bookData.filter((book) => book.id != bookid);

	const isSaved = save(updatedBooks);
	if (!isSaved) {
		return res.status(400).json({
			errors: {
				location: 'db',
				param: '',
				message: 'Could not save book'
			}
		});
	}
	res.send({
		message: 'Success'
	});
});
module.exports = router;
