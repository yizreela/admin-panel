/**
 * @jest-environment node
 */

// Mock Google Sheets API
jest.mock('../../../lib/google-sheets', () => ({
  getEmployees: jest.fn(),
  addEmployee: jest.fn(),
  updateEmployee: jest.fn(),
  deleteEmployee: jest.fn(),
}));

import { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE } from '../../app/api/employees/route';
import { getEmployees, addEmployee, updateEmployee, deleteEmployee } from '../../lib/google-sheets';

describe('Employees API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/employees', () => {
    it('should return employees successfully', async () => {
      const mockEmployees = [
        { id: '1', Nombre: 'Juan', Email: 'juan@test.com', Puesto: 'Developer' },
        { id: '2', Nombre: 'María', Email: 'maria@test.com', Puesto: 'Designer' }
      ];
      
      getEmployees.mockResolvedValue(mockEmployees);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockEmployees);
      expect(getEmployees).toHaveBeenCalledTimes(1);
    });

    it('should handle errors when fetching employees', async () => {
      getEmployees.mockRejectedValue(new Error('Database connection failed'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Error fetching employees');
    });
  });

  describe('POST /api/employees', () => {
    it('should create a new employee successfully', async () => {
      const newEmployee = {
        Nombre: 'Carlos',
        Email: 'carlos@test.com',
        Puesto: 'Manager',
        Seniority: 'Senior',
        'Proyecto Actual': 'Project Alpha',
        Skills: 'Leadership, Management'
      };

      const mockCreatedEmployee = { ...newEmployee, id: '3' };
      addEmployee.mockResolvedValue(mockCreatedEmployee);

      const request = new NextRequest('http://localhost:3000/api/employees', {
        method: 'POST',
        body: JSON.stringify(newEmployee),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Empleado agregado correctamente');
      expect(addEmployee).toHaveBeenCalledWith(newEmployee);
    });

    it('should validate required fields', async () => {
      const incompleteEmployee = {
        Nombre: 'Carlos',
        // Missing required fields
      };

      const request = new NextRequest('http://localhost:3000/api/employees', {
        method: 'POST',
        body: JSON.stringify(incompleteEmployee),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Campo requerido');
    });

    it('should handle duplicate email error', async () => {
      const duplicateEmployee = {
        Nombre: 'Carlos',
        Email: 'existing@test.com',
        Puesto: 'Manager',
        Seniority: 'Senior',
        'Proyecto Actual': 'Project Alpha',
        Skills: 'Leadership'
      };

      addEmployee.mockRejectedValue(new Error('El email ya existe'));

      const request = new NextRequest('http://localhost:3000/api/employees', {
        method: 'POST',
        body: JSON.stringify(duplicateEmployee),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('El email ya existe');
    });
  });

  describe('PUT /api/employees', () => {
    it('should update an existing employee successfully', async () => {
      const employeeId = '1';
      const updatedEmployee = {
        Nombre: 'Juan Updated',
        Email: 'juan@test.com',
        Puesto: 'Senior Developer',
        Seniority: 'Senior',
        'Proyecto Actual': 'Project Beta',
        Skills: 'React, Node.js'
      };

      const mockUpdatedEmployee = { ...updatedEmployee, id: employeeId };
      updateEmployee.mockResolvedValue(mockUpdatedEmployee);

      const request = new NextRequest('http://localhost:3000/api/employees', {
        method: 'PUT',
        body: JSON.stringify({ id: employeeId, ...updatedEmployee }),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Empleado actualizado correctamente');
      expect(updateEmployee).toHaveBeenCalledWith(employeeId, updatedEmployee);
    });

    it('should handle employee not found error', async () => {
      const employeeId = '999';
      const updatedEmployee = { Nombre: 'Test' };

      updateEmployee.mockRejectedValue(new Error('Empleado no encontrado'));

      const request = new NextRequest('http://localhost:3000/api/employees', {
        method: 'PUT',
        body: JSON.stringify({ id: employeeId, ...updatedEmployee }),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Empleado no encontrado');
    });
  });

  describe('DELETE /api/employees', () => {
    it('should delete an employee successfully', async () => {
      const employeeId = '1';
      deleteEmployee.mockResolvedValue(true);

      const request = new NextRequest(`http://localhost:3000/api/employees?id=${employeeId}`, {
        method: 'DELETE'
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Empleado eliminado correctamente');
      expect(deleteEmployee).toHaveBeenCalledWith(employeeId);
    });

    it('should handle missing ID parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/employees', {
        method: 'DELETE'
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('ID requerido');
    });

    it('should handle employee not found during deletion', async () => {
      const employeeId = '999';
      deleteEmployee.mockRejectedValue(new Error('Empleado no encontrado'));

      const request = new NextRequest(`http://localhost:3000/api/employees?id=${employeeId}`, {
        method: 'DELETE'
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Empleado no encontrado');
    });
  });
});
