import { transporter } from '@/config/email';

const SUPER_ADMIN_EMAIL = 'itsthakkarnisarg@gmail.com';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      ...options
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${options.to}`);
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
};

const generateOrganizationApprovalRequestHTML = (organizationName: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Organization Approval Request</title>
        <style>
            body { 
                font-family: 'Arial', sans-serif; 
                line-height: 1.6; 
                color: #333; 
                background-color: #f4f4f4; 
                margin: 0; 
                padding: 20px; 
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: white; 
                border-radius: 10px; 
                overflow: hidden; 
                box-shadow: 0 0 20px rgba(0,0,0,0.1); 
            }
            .header { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 30px; 
                text-align: center; 
            }
            .header h1 { 
                margin: 0; 
                font-size: 24px; 
                font-weight: bold; 
            }
            .content { 
                padding: 30px; 
            }
            .org-info { 
                background: #f8f9fa; 
                border-radius: 8px; 
                padding: 20px; 
                margin: 20px 0; 
                border-left: 4px solid #667eea; 
            }
            .org-name { 
                font-size: 18px; 
                font-weight: bold; 
                color: #333; 
                margin-bottom: 10px; 
            }
            .cta-button { 
                display: inline-block; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 15px 30px; 
                text-decoration: none; 
                border-radius: 25px; 
                font-weight: bold; 
                text-align: center; 
                margin: 20px 0; 
                transition: transform 0.2s; 
            }
            .cta-button:hover { 
                transform: translateY(-2px); 
            }
            .footer { 
                background: #f8f9fa; 
                padding: 20px; 
                text-align: center; 
                font-size: 12px; 
                color: #666; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>New Organization Approval Request</h1>
            </div>
            
            <div class="content">
                <p>Hello Admin,</p>
                
                <p>A new organization has requested approval:</p>
                
                <div class="org-info">
                    <div class="org-name">${organizationName}</div>
                </div>
                
                <p>Please review and take appropriate action.</p>
                
                <div style="text-align: center;">
                    <a href="${process.env.ADMIN_DASHBOARD_URL}" class="cta-button">
                        Review Organization
                    </a>
                </div>
            </div>
            
            <div class="footer">
                <p>This is an automated message from the Fellowship Platform</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

const generateOrganizationApprovedHTML = (organizationName: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Organization Approved</title>
        <style>
            body { 
                font-family: 'Arial', sans-serif; 
                line-height: 1.6; 
                color: #333; 
                background-color: #f4f4f4; 
                margin: 0; 
                padding: 20px; 
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: white; 
                border-radius: 10px; 
                overflow: hidden; 
                box-shadow: 0 0 20px rgba(0,0,0,0.1); 
            }
            .header { 
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
                color: white; 
                padding: 30px; 
                text-align: center; 
            }
            .header h1 { 
                margin: 0; 
                font-size: 24px; 
                font-weight: bold; 
            }
            .content { 
                padding: 30px; 
            }
            .org-info { 
                background: #f8f9fa; 
                border-radius: 8px; 
                padding: 20px; 
                margin: 20px 0; 
                border-left: 4px solid #28a745; 
            }
            .org-name { 
                font-size: 18px; 
                font-weight: bold; 
                color: #333; 
                margin-bottom: 10px; 
            }
            .cta-button { 
                display: inline-block; 
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
                color: white; 
                padding: 15px 30px; 
                text-decoration: none; 
                border-radius: 25px; 
                font-weight: bold; 
                text-align: center; 
                margin: 20px 0; 
                transition: transform 0.2s; 
            }
            .cta-button:hover { 
                transform: translateY(-2px); 
            }
            .footer { 
                background: #f8f9fa; 
                padding: 20px; 
                text-align: center; 
                font-size: 12px; 
                color: #666; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Organization Approved!</h1>
            </div>
            
            <div class="content">
                <p>Congratulations!</p>
                
                <p>Your organization has been approved:</p>
                
                <div class="org-info">
                    <div class="org-name">${organizationName}</div>
                </div>
                
                <p>You can now create forms and manage your organization.</p>
                
                <div style="text-align: center;">
                    <a href="${process.env.DASHBOARD_URL}" class="cta-button">
                        Go to Dashboard
                    </a>
                </div>
            </div>
            
            <div class="footer">
                <p>This is an automated message from the Fellowship Platform</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

const generateOrganizationRejectedHTML = (organizationName: string, reason: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Organization Application Rejected</title>
        <style>
            body { 
                font-family: 'Arial', sans-serif; 
                line-height: 1.6; 
                color: #333; 
                background-color: #f4f4f4; 
                margin: 0; 
                padding: 20px; 
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: white; 
                border-radius: 10px; 
                overflow: hidden; 
                box-shadow: 0 0 20px rgba(0,0,0,0.1); 
            }
            .header { 
                background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); 
                color: white; 
                padding: 30px; 
                text-align: center; 
            }
            .header h1 { 
                margin: 0; 
                font-size: 24px; 
                font-weight: bold; 
            }
            .content { 
                padding: 30px; 
            }
            .org-info { 
                background: #f8f9fa; 
                border-radius: 8px; 
                padding: 20px; 
                margin: 20px 0; 
                border-left: 4px solid #dc3545; 
            }
            .org-name { 
                font-size: 18px; 
                font-weight: bold; 
                color: #333; 
                margin-bottom: 10px; 
            }
            .reason { 
                color: #dc3545; 
                font-weight: bold; 
                margin-top: 10px; 
            }
            .cta-button { 
                display: inline-block; 
                background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); 
                color: white; 
                padding: 15px 30px; 
                text-decoration: none; 
                border-radius: 25px; 
                font-weight: bold; 
                text-align: center; 
                margin: 20px 0; 
                transition: transform 0.2s; 
            }
            .cta-button:hover { 
                transform: translateY(-2px); 
            }
            .footer { 
                background: #f8f9fa; 
                padding: 20px; 
                text-align: center; 
                font-size: 12px; 
                color: #666; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Organization Application Rejected</h1>
            </div>
            
            <div class="content">
                <p>We regret to inform you that your organization application has been rejected:</p>
                
                <div class="org-info">
                    <div class="org-name">${organizationName}</div>
                    <div class="reason">Reason: ${reason}</div>
                </div>
                
                <p>You can submit a new application after addressing the concerns mentioned above.</p>
                
                <div style="text-align: center;">
                    <a href="${process.env.DASHBOARD_URL}" class="cta-button">
                        Submit New Application
                    </a>
                </div>
            </div>
            
            <div class="footer">
                <p>This is an automated message from the Fellowship Platform</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

export const sendOrganizationApprovalRequest = async (organizationName: string): Promise<void> => {
  await sendEmail({
    to: SUPER_ADMIN_EMAIL,
    subject: 'New Organization Approval Request',
    text: `A new organization "${organizationName}" has been created and requires approval.`,
    html: generateOrganizationApprovalRequestHTML(organizationName)
  });
};

export const sendOrganizationApproved = async (organizationName: string, ownerEmail: string): Promise<void> => {
  await sendEmail({
    to: ownerEmail,
    subject: 'Organization Approved',
    text: `Your organization "${organizationName}" has been approved. You can now create forms and manage your organization.`,
    html: generateOrganizationApprovedHTML(organizationName)
  });
};

export const sendOrganizationRejected = async (organizationName: string, ownerEmail: string, reason: string): Promise<void> => {
  await sendEmail({
    to: ownerEmail,
    subject: 'Organization Application Rejected',
    text: `Your organization "${organizationName}" has been rejected. Reason: ${reason}`,
    html: generateOrganizationRejectedHTML(organizationName, reason)
  });
}; 