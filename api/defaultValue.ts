import { api } from '../api/axios';

export type DefaultValueType = 'FormulaUnit' | 'TestGroup' | 'MethodGroup';

export const getDefaultValues = async (type: DefaultValueType) => {
  try {
    const { data } = await api.get('/default-value', { params: { type } });
    
    console.log('Raw response:', data); // DEBUG
    
    // API trả { respCode, respText, data: { items, total, ... } }
    if (data?.respCode === 200 && data?.data?.items) {
      console.log('Items:', data.data.items); // DEBUG
      return data.data.items;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching default values:', error);
    return [];
  }
};

export const addDefaultValue = async (payload: {
  value: string;
  type: DefaultValueType;
}) => {
  try {
    const { data } = await api.post('/default-value', payload);
    console.log('Add response:', data); // DEBUG
    return data;
  } catch (error) {
    console.error('Error adding default value:', error);
    throw error;
  }
};