// Test script for workflow persistence functionality
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

// API base URL
const API_BASE_URL = 'http://localhost:3001';

// Test workflow data
const createTestWorkflow = () => ({
  name: `Test Workflow ${Date.now()}`,
  nodes: [
    {
      id: 'communicationNode-1',
      type: 'communicationNode',
      position: { x: 100, y: 100 },
      data: { 
        label: 'Communication Node',
        mode: 'send'
      }
    },
    {
      id: 'translationNode-1',
      type: 'translationNode',
      position: { x: 400, y: 100 },
      data: { 
        label: 'Translation Node',
        sourceLanguage: 'en',
        targetLanguage: 'es'
      }
    },
    {
      id: 'simetrikNode-1',
      type: 'simetrikNode',
      position: { x: 100, y: 300 },
      data: { 
        label: 'Simetrik Node',
        connectionId: 'conn-123'
      }
    }
  ],
  edges: [
    {
      id: 'e1-2',
      source: 'communicationNode-1',
      target: 'translationNode-1',
      sourceHandle: 'output',
      targetHandle: 'input'
    },
    {
      id: 'e2-3',
      source: 'translationNode-1',
      target: 'simetrikNode-1',
      sourceHandle: 'output',
      targetHandle: 'input'
    }
  ]
});

// Test create workflow
const testCreateWorkflow = async () => {
  console.log('\n--- Testing Create Workflow ---');
  
  try {
    const workflowData = createTestWorkflow();
    const response = await axios.post(`${API_BASE_URL}/api/workflows`, workflowData);
    
    if (response.data.success) {
      console.log('✅ Create workflow successful');
      console.log('Workflow ID:', response.data.workflow.id);
      console.log('Workflow name:', response.data.workflow.name);
      return response.data.workflow.id;
    } else {
      console.log('❌ Create workflow failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error testing create workflow:', error.message);
    return null;
  }
};

// Test get all workflows
const testGetAllWorkflows = async () => {
  console.log('\n--- Testing Get All Workflows ---');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/api/workflows`);
    
    if (response.data.success) {
      console.log('✅ Get all workflows successful');
      console.log('Workflow count:', response.data.workflows.length);
      return response.data.workflows;
    } else {
      console.log('❌ Get all workflows failed:', response.data.message);
      return [];
    }
  } catch (error) {
    console.error('❌ Error testing get all workflows:', error.message);
    return [];
  }
};

// Test get workflow by ID
const testGetWorkflowById = async (workflowId) => {
  console.log('\n--- Testing Get Workflow By ID ---');
  
  if (!workflowId) {
    console.log('❌ No workflow ID provided');
    return null;
  }
  
  try {
    const response = await axios.get(`${API_BASE_URL}/api/workflows/${workflowId}`);
    
    if (response.data.success) {
      console.log('✅ Get workflow by ID successful');
      console.log('Workflow name:', response.data.workflow.name);
      console.log('Node count:', response.data.workflow.nodes.length);
      console.log('Edge count:', response.data.workflow.edges.length);
      return response.data.workflow;
    } else {
      console.log('❌ Get workflow by ID failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error testing get workflow by ID:', error.message);
    return null;
  }
};

// Test update workflow
const testUpdateWorkflow = async (workflowId) => {
  console.log('\n--- Testing Update Workflow ---');
  
  if (!workflowId) {
    console.log('❌ No workflow ID provided');
    return false;
  }
  
  try {
    // First get the current workflow
    const getResponse = await axios.get(`${API_BASE_URL}/api/workflows/${workflowId}`);
    if (!getResponse.data.success) {
      console.log('❌ Failed to get workflow for update');
      return false;
    }
    
    const workflow = getResponse.data.workflow;
    
    // Add a new node and edge
    const updatedWorkflow = {
      ...workflow,
      name: `${workflow.name} (Updated)`,
      nodes: [
        ...workflow.nodes,
        {
          id: 'comparisonNode-1',
          type: 'comparisonNode',
          position: { x: 400, y: 300 },
          data: { 
            label: 'Comparison Node',
            compareType: 'exact'
          }
        }
      ],
      edges: [
        ...workflow.edges,
        {
          id: 'e3-4',
          source: 'simetrikNode-1',
          target: 'comparisonNode-1',
          sourceHandle: 'output',
          targetHandle: 'input'
        }
      ]
    };
    
    const response = await axios.put(`${API_BASE_URL}/api/workflows/${workflowId}`, updatedWorkflow);
    
    if (response.data.success) {
      console.log('✅ Update workflow successful');
      console.log('Updated node count:', response.data.workflow.nodes.length);
      console.log('Updated edge count:', response.data.workflow.edges.length);
      return true;
    } else {
      console.log('❌ Update workflow failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing update workflow:', error.message);
    return false;
  }
};

// Test delete workflow
const testDeleteWorkflow = async (workflowId) => {
  console.log('\n--- Testing Delete Workflow ---');
  
  if (!workflowId) {
    console.log('❌ No workflow ID provided');
    return false;
  }
  
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/workflows/${workflowId}`);
    
    if (response.data.success) {
      console.log('✅ Delete workflow successful');
      return true;
    } else {
      console.log('❌ Delete workflow failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing delete workflow:', error.message);
    return false;
  }
};

// Test localStorage persistence
const testLocalStoragePersistence = () => {
  console.log('\n--- Testing localStorage Persistence (Simulated) ---');
  
  try {
    // Create a mock workflow
    const workflow = createTestWorkflow();
    
    // Simulate saving to localStorage
    const mockLocalStorage = {};
    mockLocalStorage['currentWorkflow'] = JSON.stringify(workflow);
    
    // Simulate retrieving from localStorage
    const retrievedWorkflow = JSON.parse(mockLocalStorage['currentWorkflow']);
    
    if (retrievedWorkflow && 
        retrievedWorkflow.nodes.length === workflow.nodes.length && 
        retrievedWorkflow.edges.length === workflow.edges.length) {
      console.log('✅ localStorage persistence simulation successful');
      console.log('Retrieved node count:', retrievedWorkflow.nodes.length);
      console.log('Retrieved edge count:', retrievedWorkflow.edges.length);
      return true;
    } else {
      console.log('❌ localStorage persistence simulation failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing localStorage persistence:', error.message);
    return false;
  }
};

// Run all tests
const runTests = async () => {
  console.log('=== Workflow Persistence Functionality Tests ===');
  
  // Test localStorage persistence (simulated)
  testLocalStoragePersistence();
  
  // Test create workflow
  const workflowId = await testCreateWorkflow();
  
  // Test get all workflows
  const workflows = await testGetAllWorkflows();
  
  // Test get workflow by ID
  if (workflowId) {
    await testGetWorkflowById(workflowId);
  }
  
  // Test update workflow
  if (workflowId) {
    await testUpdateWorkflow(workflowId);
  }
  
  // Test get updated workflow
  if (workflowId) {
    await testGetWorkflowById(workflowId);
  }
  
  // Test delete workflow
  if (workflowId) {
    await testDeleteWorkflow(workflowId);
  }
  
  console.log('\n=== Workflow Persistence Tests Completed ===');
};

// Run tests
runTests().catch(error => {
  console.error('Error running tests:', error);
});
