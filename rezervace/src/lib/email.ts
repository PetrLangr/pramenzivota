// E-mailový systém inspirovaný Amelia notifikacemi

import nodemailer from 'nodemailer';

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface AppointmentEmailData {
  customerName: string;
  serviceName: string;
  employeeName: string;
  appointmentDate: string;
  appointmentTime: string;
  totalPrice: number;
  appointmentId: string;
  paymentStatus: string;
  centerInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Šablona pro potvrzení rezervace zákazníkovi
  generateConfirmationTemplate(data: AppointmentEmailData): EmailTemplate {
    const subject = `Potvrzení rezervace #${data.appointmentId} - ${data.centerInfo.name}`;
    
    const htmlContent = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #1E3A5F, #2E86AB); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Rezervace potvrzena!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Děkujeme za vaši rezervaci</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <h2 style="color: #1E3A5F; margin-top: 0;">Detaily rezervace</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 10px 0; font-weight: bold; color: #6b7280;">Číslo rezervace:</td>
              <td style="padding: 10px 0;">#${data.appointmentId}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 10px 0; font-weight: bold; color: #6b7280;">Služba:</td>
              <td style="padding: 10px 0;">${data.serviceName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 10px 0; font-weight: bold; color: #6b7280;">Datum:</td>
              <td style="padding: 10px 0;">${data.appointmentDate}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 10px 0; font-weight: bold; color: #6b7280;">Čas:</td>
              <td style="padding: 10px 0;">${data.appointmentTime}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 10px 0; font-weight: bold; color: #6b7280;">Terapeut:</td>
              <td style="padding: 10px 0;">${data.employeeName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 10px 0; font-weight: bold; color: #6b7280;">Cena:</td>
              <td style="padding: 10px 0; font-weight: bold; color: #7FB069;">${data.totalPrice.toLocaleString('cs-CZ')} Kč</td>
            </tr>
          </table>
          
          <div style="background: #E6FFFA; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1E3A5F; margin-top: 0;">Co dál?</h3>
            <ul style="color: #4A5568; line-height: 1.6; padding-left: 20px;">
              <li>Dostavte se 10 minut před začátkem terapie</li>
              <li>Připomínku obdržíte den před termínem</li>
              <li>Pro zrušení volejte nejpozději 24h předem</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              ${data.centerInfo.name}<br>
              ${data.centerInfo.address}<br>
              Tel: ${data.centerInfo.phone} | Email: ${data.centerInfo.email}
            </p>
          </div>
        </div>
      </div>
    `;

    const textContent = `
      Potvrzení rezervace #${data.appointmentId}
      
      Vážený/á ${data.customerName},
      
      Vaše rezervace byla úspěšně vytvořena.
      
      Detaily:
      - Služba: ${data.serviceName}
      - Datum: ${data.appointmentDate} v ${data.appointmentTime}
      - Terapeut: ${data.employeeName}
      - Cena: ${data.totalPrice.toLocaleString('cs-CZ')} Kč
      
      Prosím dostavte se 10 minut před začátkem.
      
      S pozdravem,
      ${data.centerInfo.name}
      ${data.centerInfo.phone}
    `;

    return { subject, htmlContent, textContent };
  }

  // Šablona pro upozornění zaměstnanci
  generateEmployeeNotificationTemplate(data: AppointmentEmailData): EmailTemplate {
    const subject = `Nová rezervace - ${data.appointmentDate} v ${data.appointmentTime}`;
    
    const htmlContent = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #1E3A5F; margin-top: 0;">Nová rezervace</h2>
          
          <p><strong>Zákazník:</strong> ${data.customerName}</p>
          <p><strong>Služba:</strong> ${data.serviceName}</p>
          <p><strong>Datum a čas:</strong> ${data.appointmentDate} v ${data.appointmentTime}</p>
          <p><strong>Cena:</strong> ${data.totalPrice.toLocaleString('cs-CZ')} Kč</p>
          
          <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 5px;">
            <p style="margin: 0; color: #6b7280;">
              Přihlašte se do <a href="/admin">administračního panelu</a> pro více detailů.
            </p>
          </div>
        </div>
      </div>
    `;

    const textContent = `
      Nová rezervace pro ${data.employeeName}
      
      Zákazník: ${data.customerName}
      Služba: ${data.serviceName}
      Datum: ${data.appointmentDate} v ${data.appointmentTime}
      Cena: ${data.totalPrice.toLocaleString('cs-CZ')} Kč
    `;

    return { subject, htmlContent, textContent };
  }

  async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: `"${process.env.APP_NAME}" <${process.env.SMTP_USER}>`,
        to,
        subject: template.subject,
        text: template.textContent,
        html: template.htmlContent,
      });

      return true;
    } catch (error) {
      console.error('Chyba při odesílání e-mailu:', error);
      return false;
    }
  }

  async sendAppointmentConfirmation(customerEmail: string, data: AppointmentEmailData): Promise<boolean> {
    const template = this.generateConfirmationTemplate(data);
    return this.sendEmail(customerEmail, template);
  }

  async sendEmployeeNotification(employeeEmail: string, data: AppointmentEmailData): Promise<boolean> {
    const template = this.generateEmployeeNotificationTemplate(data);
    return this.sendEmail(employeeEmail, template);
  }
}

export const emailService = new EmailService();