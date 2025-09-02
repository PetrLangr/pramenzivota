import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Začíná seed databáze...');

  // Vytvoř admin uživatele
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pramenzivota.cz' },
    update: {},
    create: {
      email: 'admin@pramenzivota.cz',
      name: 'Administrátor',
      role: 'ADMIN',
      password: 'hashedpassword123' // V reálném systému by bylo hash
    }
  });

  console.log('✅ Admin uživatel vytvořen');

  // Vytvoř kategorie služeb
  const energeticTherapy = await prisma.serviceCategory.upsert({
    where: { id: 'energetic-therapy' },
    update: {},
    create: {
      id: 'energetic-therapy',
      name: 'Energetické terapie',
      description: 'Léčení a harmonizace energetických toků v těle',
      color: '#3B82F6',
      sortOrder: 1
    }
  });

  const holisticApproaches = await prisma.serviceCategory.upsert({
    where: { id: 'holistic-approaches' },
    update: {},
    create: {
      id: 'holistic-approaches', 
      name: 'Holistické přístupy',
      description: 'Komplexní terapie pro tělo, mysl i ducha',
      color: '#10B981',
      sortOrder: 2
    }
  });

  console.log('✅ Kategorie služeb vytvořeny');

  // Vytvoř služby
  const services = [
    {
      id: 'energy-diagnosis',
      name: 'Energetické vyšetření',
      description: 'Komplexní diagnostika energetických toků a blokád v těle.',
      duration: 60,
      price: 1200,
      categoryId: energeticTherapy.id,
      color: '#3B82F6'
    },
    {
      id: 'chakra-therapy',
      name: 'Chakrová terapie',
      description: 'Harmonizace a vyrovnání všech sedmi hlavních chaker.',
      duration: 90,
      price: 1500,
      categoryId: energeticTherapy.id,
      color: '#8B5CF6'
    },
    {
      id: 'crystal-therapy',
      name: 'Křišťálová terapie',
      description: 'Využití přirozených vibrací a energie drahokámů.',
      duration: 75,
      price: 1300,
      categoryId: holisticApproaches.id,
      color: '#F59E0B'
    },
    {
      id: 'reiki-healing',
      name: 'Reiki léčení',
      description: 'Japonská technika energetického léčení a relaxace.',
      duration: 60,
      price: 1100,
      categoryId: holisticApproaches.id,
      color: '#10B981'
    },
    {
      id: 'holistic-consultation',
      name: 'Holistická konzultace',
      description: 'Komplexní přístup k tělu, mysli a duchu s individuálním plánem.',
      duration: 120,
      price: 2000,
      categoryId: holisticApproaches.id,
      color: '#EF4444'
    }
  ];

  for (const serviceData of services) {
    await prisma.service.upsert({
      where: { id: serviceData.id },
      update: {},
      create: serviceData
    });
  }

  console.log('✅ Služby vytvořeny');

  // Vytvoř zaměstnance
  const employees = [
    {
      id: 'petra-svoboda',
      firstName: 'Petra',
      lastName: 'Svoboda',
      email: 'petra.svoboda@pramenzivota.cz',
      phone: '+420 123 456 789',
      notes: 'Hlavní energetická terapeutka'
    },
    {
      id: 'marie-krasna',
      firstName: 'Marie',
      lastName: 'Krásná',
      email: 'marie.krasna@pramenzivota.cz',
      phone: '+420 987 654 321',
      notes: 'Specialistka na holistické přístupy'
    }
  ];

  for (const empData of employees) {
    const employee = await prisma.employee.upsert({
      where: { id: empData.id },
      update: {},
      create: empData
    });

    // Přiřaď pracovní dobu (Po-Pá 9-17, Pá kratší)
    const workingDays = [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }, // Pondělí
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' }, // Úterý  
      { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' }, // Středa
      { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' }, // Čtvrtek
      { dayOfWeek: 5, startTime: '09:00', endTime: '15:00' }  // Pátek
    ];

    for (const workDay of workingDays) {
      await prisma.workingHours.upsert({
        where: {
          id: `${employee.id}-${workDay.dayOfWeek}`
        },
        update: {},
        create: {
          id: `${employee.id}-${workDay.dayOfWeek}`,
          employeeId: employee.id,
          ...workDay
        }
      });
    }

    // Přiřaď všechny služby zaměstnanci
    for (const service of services) {
      await prisma.employeeService.upsert({
        where: {
          employeeId_serviceId: {
            employeeId: employee.id,
            serviceId: service.id
          }
        },
        update: {},
        create: {
          employeeId: employee.id,
          serviceId: service.id
        }
      });
    }
  }

  console.log('✅ Zaměstnanci a jejich rozvrhy vytvořeny');

  // Vytvoř testovací zákazníky
  const customers = [
    {
      id: 'anna-novakova',
      firstName: 'Anna',
      lastName: 'Nováková',
      email: 'anna.novakova@email.cz',
      phone: '+420 111 222 333'
    },
    {
      id: 'josef-novak',
      firstName: 'Josef',
      lastName: 'Novák',
      email: 'josef.novak@email.cz',
      phone: '+420 444 555 666'
    }
  ];

  for (const custData of customers) {
    await prisma.customer.upsert({
      where: { id: custData.id },
      update: {},
      create: custData
    });
  }

  console.log('✅ Testovací zákazníci vytvořeni');

  // Vytvoř více zákazníků s historií
  const moreCustomers = [
    {
      id: 'eva-cerna',
      firstName: 'Eva',
      lastName: 'Černá',
      email: 'eva.cerna@email.cz',
      phone: '+420 777 888 999',
      totalAppointments: 5,
      totalSpent: 7200
    },
    {
      id: 'tomas-dvorak',
      firstName: 'Tomáš',
      lastName: 'Dvořák',
      email: 'tomas.dvorak@email.cz',
      totalAppointments: 2,
      totalSpent: 2400
    },
    {
      id: 'marie-novotna',
      firstName: 'Marie',
      lastName: 'Novotná',
      email: 'marie.novotna@email.cz',
      phone: '+420 555 666 777',
      totalAppointments: 8,
      totalSpent: 12800
    }
  ];

  for (const custData of moreCustomers) {
    await prisma.customer.upsert({
      where: { id: custData.id },
      update: {},
      create: custData
    });
  }

  // Vytvoř testovací rezervace
  const testAppointments = [
    {
      id: 'app-1',
      serviceId: 'energy-diagnosis',
      employeeId: 'petra-svoboda',
      customerId: 'anna-novakova',
      startDateTime: new Date('2024-08-30T09:00:00'),
      endDateTime: new Date('2024-08-30T10:00:00'),
      totalPrice: 1200,
      totalDuration: 60,
      status: 'APPROVED' as const
    },
    {
      id: 'app-2',
      serviceId: 'chakra-therapy',
      employeeId: 'marie-krasna',
      customerId: 'eva-cerna',
      startDateTime: new Date('2024-08-31T14:00:00'),
      endDateTime: new Date('2024-08-31T15:30:00'),
      totalPrice: 1500,
      totalDuration: 90,
      status: 'PENDING' as const
    },
    {
      id: 'app-3',
      serviceId: 'reiki-healing',
      employeeId: 'petra-svoboda',
      customerId: 'marie-novotna',
      startDateTime: new Date('2024-09-02T10:00:00'),
      endDateTime: new Date('2024-09-02T11:00:00'),
      totalPrice: 1100,
      totalDuration: 60,
      status: 'APPROVED' as const
    }
  ];

  for (const appData of testAppointments) {
    await prisma.appointment.upsert({
      where: { id: appData.id },
      update: {},
      create: appData
    });
  }

  console.log('✅ Testovací rezervace vytvořeny');
  console.log('🎉 Seed databáze dokončen!');
}

main()
  .catch((e) => {
    console.error('❌ Chyba při seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });