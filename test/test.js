/*jshint expr: true*/

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
const PugTransform = require('../');

chai.should();
chai.use(chaiAsPromised);

const testFile = path.normalize(__dirname + '/data/test.pug');
const malformedFile = path.normalize(__dirname + '/data/malformed.pug');

var transform = new PugTransform();

var destFilename = path.normalize(os.tmpdir() + '/testdonotpug');

describe('pug', () => {

	var test;
	var malformed;
	var compiled;
	before(() => {
		if (fs.existsSync(destFilename)) {
			fs.unlinkSync(destFilename);
		}
		test = fs.readFileSync(testFile, { encoding: 'utf8' });
		malformed = fs.readFileSync(malformedFile, { encoding: 'utf8' });
	});

	describe('compiler', () => {

		it ('should return true when filename is .html', () => {
			expect(transform.canTransform('my.html')).to.be.true;
		});

		it ('should return false when filename is .pug', () => {
			expect(transform.canTransform('my.pug')).to.be.false;
		});

		it ('should return false when filename is .pug', () => {
			expect(transform.allowAccess('my.pug')).to.be.false;
		});

		it ('should return true when filename is .htm', () => {
			expect(transform.allowAccess('my.htm')).to.be.true;
		});

		it ('should return error on malformed pug', () => {
			return transform.compile(malformedFile, destFilename).should.eventually.be.rejected;
		});

		it ('should return compiled pug', () => {
			return transform.compile(testFile, destFilename).then((result) => {
				expect(fs.existsSync(destFilename)).to.be.true;
				expect(result.files).to.be.an.array;
				expect(result.files[0]).to.be.a('string');
			}).should.eventually.be.fulfilled;
		});

	});

	describe('renderer', () => {

		it ('should render html from compiled pug', () => {
			return new Promise((resolved, rejected) => {
				fs.readFile(destFilename, 'utf8', (err, data) => {
					if (err) return rejected(err);
					transform.render(data).then((result) => {
						expect(result.data).to.be.equal('<h1>this is pug</h1>');
						resolved(result.data);
					}, rejected);
				});
			}).should.eventually.be.fulfilled;
		});

	});

});
