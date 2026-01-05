'use client';
import { Table, Button, Modal, Form, Input, Select, message } from 'antd';
import { useEffect, useState } from 'react';
import { getDefaultValues, addDefaultValue, DefaultValueType } from '../api/defaultValue';
import {logout} from '../api/auth';
const { Option } = Select;
const TYPE_OPTIONS: DefaultValueType[] = ['FormulaUnit', 'TestGroup', 'MethodGroup'];

export default function DefaultValueTable() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<DefaultValueType>('FormulaUnit');
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async () => {
    try {
      setLoading(true);
      const items = await getDefaultValues(type);
      setData(Array.isArray(items) ? items : []);
    } catch (err) {
      message.error('Không thể tải dữ liệu');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // mỗi khi đổi filter type, sync vào form nếu đang mở modal
    if (open) form.setFieldsValue({ type });
  }, [type]);

  // mở modal luôn sync type hiện tại vào form
  const openModal = () => {
    form.setFieldsValue({ type });
    setOpen(true);
  };

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      // đảm bảo giá trị type đúng với filter hiện tại
      const payload = { ...values, type };
      await addDefaultValue(payload);
      message.success('Thêm thành công');
      setOpen(false);
      form.resetFields();
      await fetchData();
    } catch (e: any) {
      if (e?.errorFields) return; // lỗi validate form
      message.error(e?.response?.data?.message || 'Thêm thất bại');
    }
  };
  const handleLogOut = async () => {
    Modal.confirm({
      title: 'Xác nhận đăng xuất',
      content: 'Bạn có chắc chắn muốn đăng xuất không?',
      okText: 'Đăng xuất',
      cancelText: 'Hủy',
      onOk: async () => { 
        await logout();
      }
  }
)
};
  const columns = [
    { title: 'ID', dataIndex: 'id', width: 200 },
    { title: 'Value', dataIndex: 'value' },
    { title: 'Type', dataIndex: 'type' },
  ];

  return (
    <>

      <div style={{ marginBottom: 16, display: 'flex', gap: 12, marginTop: 16 }}>
        <Select value={type} onChange={setType} style={{ width: 200 }}>
          {TYPE_OPTIONS.map(t => (
            <Option key={t} value={t}>{t}</Option>
          ))}
        </Select>
        <Button type="primary" onClick={openModal}>Thêm mới</Button>
        <Button danger onClick={() => handleLogOut()} style={{ marginLeft: 'auto' }} >
          Đăng xuất
        </Button>
      </div>

      <Table
        rowKey={(row) => row.id ?? row._id ?? `${row.type}-${row.value}`}
        columns={columns}
        dataSource={Array.isArray(data) ? data : []}
        loading={loading}
        bordered
      />

      <Modal
        title="Thêm Default Value"
        open={open}
        onOk={handleAdd}
        onCancel={() => setOpen(false)}
        okText="Lưu"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ type }}
          preserve={false} // remount để initialValues được áp dụng lại
        >
          <Form.Item label="Type" name="type" rules={[{ required: true }]}>
            <Select disabled>
              {TYPE_OPTIONS.map(t => (
                <Option key={t} value={t}>{t}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Value"
            name="value"
            rules={[{ required: true, message: 'Nhập value' }]}
          >
            <Input placeholder="Nhập giá trị" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}