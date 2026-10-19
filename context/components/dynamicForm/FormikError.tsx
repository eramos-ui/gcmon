// components/FormikError.tsx
import { useField } from 'formik';

interface FormikErrorProps {
  name: string;
  className?: string;
}

export const FormikError: React.FC<FormikErrorProps> = ({ name, className = "text-red-500 text-sm mt-1" }) => {
  const [, meta] = useField(name);

  if (!meta.touched || !meta.error) return null;

  return <div className={className}>{meta.error}</div>;
};