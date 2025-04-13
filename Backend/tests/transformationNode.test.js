const { expect } = require('chai');
const sinon = require('sinon');
const TransformationNode = require('../models/TransformationNode');

describe('TransformationNode Model Tests', () => {
  describe('constructor', () => {
    it('should create a TransformationNode with valid parameters', () => {
      // Arrange
      const params = {
        name: 'Test Node',
        instruction: 'Test instruction',
        outputTemplate: 'Test template',
        model: 'claude-3-haiku-20240307'
      };
      
      // Act
      const node = new TransformationNode(params);
      
      // Assert
      expect(node.name).to.equal(params.name);
      expect(node.instruction).to.equal(params.instruction);
      expect(node.outputTemplate).to.equal(params.outputTemplate);
      expect(node.model).to.equal(params.model);
      expect(node.id).to.be.a('string');
      expect(node.createdAt).to.be.a('string');
    });
    
    it('should use default values when parameters are missing', () => {
      // Arrange
      const params = {
        name: 'Test Node'
      };
      
      // Act
      const node = new TransformationNode(params);
      
      // Assert
      expect(node.name).to.equal(params.name);
      expect(node.instruction).to.equal('');
      expect(node.outputTemplate).to.equal('');
      expect(node.model).to.equal('claude-3-haiku-20240307');
      expect(node.id).to.be.a('string');
    });
    
    it('should throw an error when name is missing', () => {
      // Arrange
      const params = {
        instruction: 'Test instruction'
      };
      
      // Act & Assert
      expect(() => new TransformationNode(params)).to.throw('Name is required');
    });
  });
  
  describe('validate', () => {
    it('should return true for valid node', () => {
      // Arrange
      const node = new TransformationNode({
        name: 'Test Node',
        instruction: 'Test instruction',
        outputTemplate: 'Test template'
      });
      
      // Act
      const result = node.validate();
      
      // Assert
      expect(result).to.be.true;
    });
    
    it('should throw an error for invalid node', () => {
      // Arrange
      const node = new TransformationNode({
        name: 'Test Node'
      });
      
      // Modify the node to make it invalid
      node.name = '';
      
      // Act & Assert
      expect(() => node.validate()).to.throw('Name is required');
    });
  });
  
  describe('toJSON', () => {
    it('should return a JSON representation of the node', () => {
      // Arrange
      const params = {
        name: 'Test Node',
        instruction: 'Test instruction',
        outputTemplate: 'Test template',
        model: 'claude-3-haiku-20240307'
      };
      const node = new TransformationNode(params);
      
      // Act
      const json = node.toJSON();
      
      // Assert
      expect(json).to.be.an('object');
      expect(json.name).to.equal(params.name);
      expect(json.instruction).to.equal(params.instruction);
      expect(json.outputTemplate).to.equal(params.outputTemplate);
      expect(json.model).to.equal(params.model);
      expect(json.id).to.equal(node.id);
      expect(json.createdAt).to.equal(node.createdAt);
    });
  });
  
  describe('fromJSON', () => {
    it('should create a node from JSON data', () => {
      // Arrange
      const json = {
        id: '123',
        name: 'Test Node',
        instruction: 'Test instruction',
        outputTemplate: 'Test template',
        model: 'claude-3-haiku-20240307',
        createdAt: '2025-04-13T04:00:00.000Z'
      };
      
      // Act
      const node = TransformationNode.fromJSON(json);
      
      // Assert
      expect(node).to.be.an.instanceOf(TransformationNode);
      expect(node.id).to.equal(json.id);
      expect(node.name).to.equal(json.name);
      expect(node.instruction).to.equal(json.instruction);
      expect(node.outputTemplate).to.equal(json.outputTemplate);
      expect(node.model).to.equal(json.model);
      expect(node.createdAt).to.equal(json.createdAt);
    });
    
    it('should handle missing optional fields', () => {
      // Arrange
      const json = {
        id: '123',
        name: 'Test Node',
        createdAt: '2025-04-13T04:00:00.000Z'
      };
      
      // Act
      const node = TransformationNode.fromJSON(json);
      
      // Assert
      expect(node).to.be.an.instanceOf(TransformationNode);
      expect(node.id).to.equal(json.id);
      expect(node.name).to.equal(json.name);
      expect(node.instruction).to.equal('');
      expect(node.outputTemplate).to.equal('');
      expect(node.model).to.equal('claude-3-haiku-20240307');
    });
  });
});
