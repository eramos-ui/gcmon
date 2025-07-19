// components/FieldWrapper.tsx
import { FormikError } from '@/components/dynamicForm/FormikError';

export const FieldWrapper: React.FC<{ name: string; children: React.ReactNode }> = ({ name, children }) => {
//   console.log('en FieldWrapper name',name);
  return   (
  <div>
    {children}
    <FormikError name={name} />
  </div>
  )
};