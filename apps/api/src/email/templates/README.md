# Email Templates

Professional HTML email templates for TrustTax application.

## Templates Available

### 1. `password-reset.html`
**Purpose**: Password reset emails  
**Variables**:
- `{{userName}}` - User's name or "there"
- `{{resetUrl}}` - Password reset link
- `{{userEmail}}` - User's email address
- `{{year}}` - Current year

**Trigger**: When user requests password reset via forgot password

---

### 2. `account-not-found.html`
**Purpose**: Marketing email when reset requested for non-existent account  
**Variables**:
- `{{userEmail}}` - Email address entered
- `{{year}}` - Current year

**Trigger**: Password reset requested for unregistered email  
**Features**: Converts failed attempt into sales opportunity

---

### 3. `email-verification.html`
**Purpose**: Email address verification for new registrations  
**Variables**:
- `{{userName}}` - User's name or "there"
- `{{verifyUrl}}` - Email verification link
- `{{userEmail}}` - User's email address
- `{{year}}` - Current year

**Trigger**: New user registration

---

## Design Features

All templates include:
- ✅ **Responsive design** - Mobile and desktop friendly
- ✅ **Table-based layout** - Maximum email client compatibility
- ✅ **Professional branding** - TrustTax logo and colors
- ✅ **Clear CTAs** - Prominent action buttons
- ✅ **Security icons** - Visual trust indicators
- ✅ **Footer** - Company info and social links

**Color Scheme**:
- Primary: `#0F172A` (Dark blue-gray)
- Accent: `#3B82F6` (Blue)
- Success: `#10B981` (Green)
- Warning: `#F59E0B` (Orange)

---

## Adding New Templates

1. Create new `.html` file in this directory
2. Use table-based layout (see existing templates)
3. Mark variables with `{{variableName}}` syntax
4. Add method in `EmailService` to use template:

```typescript
async sendNewEmail(email: string, customVar: string) {
    const htmlContent = this.loadTemplate('new-template', {
        customVar: customVar,
        userEmail: email,
        year: new Date().getFullYear().toString()
    });
    
    // ... send email
}
```

---

## Testing Templates

To preview templates:
1. Open `.html` file in browser
2. Manually replace `{{variables}}` with test data
3. Test in https://www.emailonacid.com/ or https://litmus.com/

**Note**: Email clients have limited CSS support. Avoid:
- Flexbox
- Grid
- Advanced CSS selectors
- External stylesheets

Always use inline styles and tables for layout.

---

## Template Guidelines

### DO:
✅ Use tables for layout  
✅ Inline CSS styles  
✅ Web-safe fonts  
✅ Alt text for images  
✅ Clear CTAs  
✅ Mobile-friendlyWidth (max 600px)

### DON'T:
❌ External CSS files  
❌ JavaScript  
❌ Flash or plugins  
❌ Background images (limited support)  
❌ Forms (won't work in most clients)

---

## Compatibility

Templates tested with:
- ✅ Gmail (Web, iOS, Android)
- ✅ Outlook (Web, Desktop, Mobile)
- ✅ Apple Mail (macOS, iOS)
- ✅ Yahoo Mail
- ✅ ProtonMail

For best results, keep templates simple and table-based.
