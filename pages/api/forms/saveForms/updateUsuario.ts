// /pages/api/forms/saveForms/updateUsuario.ts
/*
Aquí se graba el formulario dinámico de la coleción User de la BD 
*/
import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Rol } from '@/models/Rol';
import { getUserVigenteByEmail } from '@/app/services/users/getUserVigenteByEmail';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { action,idUserModification, row, password } = JSON.parse(req.body);//
  const id=(row._id)?row._id: null;
  console.log('en updateUsuario row',action,idUserModification, row, password);
   if (action ==='delete') {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      user.valid="no Vigente";
      console.log('en delete', user);
      await user.save();
      return res.status(200).json({ message: 'Usuario eliminado' });
   }
  try { 
    const roles=await Rol.find();
    const rol=roles.find(r => Number(r.value) === Number(row.roleId));
    const role=rol?.label;//para grabar también role que es el label del rol
    // console.log('en updateUsuario  rol',rol,role);
    const vigente=(row.valid === 'vigente')?true:false;
    console.log('vigente',vigente)
    if (id) {
      // 🔁 UPDATE parcial
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      console.log('en updateUsuario  UPDATE user actual',user);
      // Solo los campos permitidos
      user.name = row.name;
      user.email = row.email;
      user.userModification = idUserModification;
      user.aditionalData = row.aditionalData;
      user.phone = row.phone;
      user.rut = row.rut;
      // user.isValid = (valid ==='vigente')?true:false;
      user.valid=(vigente )?'vigente':'No vigente';
      user.role = role;
      user.roleId = row.roleId;
      user.idUser=row.idUser;
      console.log('en updateUsuario  UPDATE user actualizando',user);
      await user.save();
      return res.status(200).json({ message: 'Usuario actualizado', user });

    } else {
      const emailAdd=row.email.toString();
      const userByEmail=await getUserVigenteByEmail(emailAdd);
      // console.log('en updateUsuario  userByEmail',userByEmail);
      if (userByEmail) {
        return res.status(400).json({ error: 'Ya existe un usuario con este correo electrónico.' });
      }
      type IdUserOnly = { idUser: number };//busca idUser
      const userMax = await User.findOne({}, 'idUser')
        .sort({ idUser: -1 })
        .lean<IdUserOnly | null>();
      //  console.log('userMax',userMax,typeof userMax, userMax?.idUser)
      let idUser=row.idUser;
      if  (userMax)  idUser= userMax?.idUser;
      // 🆕 INSERT: completar campos faltantes
      const newUser = new User({
        name:row.name,
        email:row.email,
        userModification:idUserModification,
        aditionalData:row.aditionalData,
        phone:row.phone,
        rut:row.rut,
        idUser:idUser,
        role:role,
        roleId:row.roleId,
        // Campos adicionales requeridos
        user: row.email,                      // por ejemplo, usar email como user si no se define
        password,         // ⚠️ reemplazar luego por un flujo real de password
        theme: 'light',
        // system: 'gastoscomunes',                 // por defecto, si aplica
        valid:(vigente )?'vigente':'No vigente',
        validDate: new Date(),
        avatar: '',                      // opcional
        roleswkf: [],
      });
      console.log('en updateUsuario  INSERT newUser',newUser);
      await newUser.save();
      return res.status(201).json({ message: 'Usuario creado', user: newUser });
    }
  } catch (error) {
    console.error('Error en updateUsuario:', error);
    return res.status(500).json({ message: 'Error interno', error });
  }
}
