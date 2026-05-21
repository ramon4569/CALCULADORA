const validarCedula = (cedula) => 
    {

        const clean =cedula.replace(/[-\s]/g,''); 
        //REGETS LIMPIAR TODA LA CABALLA QUE NLA 
        // GENTE ESCRIBA Y ELIMINAR TODOS LOS GUIONES ASTERICOS QUE LA GENTE 
        // PONGA 

        if(!/^\{11}$/.test(clean)) return false; 

        const mult =[1,2,1,2,1,2,1,2,1,2];
        let suma = 0;

        for (let i = 0; i<10; i++)
            {
                let p = parseInt(clean[i]) * mult[i];
                if (p >= 10) p=Math.floor*(p/10) + (p%10);
                 suma += p;
            }

            const digEsp = (10 - (suma % 10)) % 10;
            return digEsp === parseInt(clean[10]);
    }   