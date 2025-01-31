const uuid = require('uuid');
const bcrypt = require('bcryptjs');
const User = require('../models/users');
const Forgotpassword = require('../models/forgotpassword');
const resend1 = require('resend');
const resend = new resend1.Resend(process.env.RESEND_API_KEY);

const forgotpassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User doesnt exist' });
        }

        const id = uuid.v4();
        const forgotpasswordRequest = new Forgotpassword({ id, userId: user._id, active: true });
        await forgotpasswordRequest.save();

        const resetLink = `http://localhost:3000/password/resetpassword/${id}`;
        await sendPasswordResetEmail(email, resetLink);

        return res.status(200).json({
            message: 'Link to reset password sent to your mail ',
            success: true,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message, success: false });
    }
};

const sendPasswordResetEmail = async (email, resetLink) => {
  try {
    const response = await resend.emails.send({
      to: email,
      from: 'exform.arc@gmail.com',
      subject: 'Password Reset for Your Account',
      html: `<a href="${resetLink}">Reset your password</a>`,
    });

    console.log('Password reset email sent:', response.statusCode);

  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error; 
  }
};


const resetpassword = async (req, res) => {
  const id = req.params.id;
  try {
      const forgotpasswordRequest = await Forgotpassword.findOne({ id });

      if (!forgotpasswordRequest || forgotpasswordRequest.isExpired) { // Check if request exists and is not expired
          return res.status(404).send("Reset password request not found or expired.");
      }

      await Forgotpassword.updateOne({ id }, { active: false });

      res.status(200).send(`
         <html>
<head>
<style>
 body {
font-family: sans-serif;
margin: 0;
padding: 20px;
}

form {
display: flex;
flex-direction: column;
gap: 10px;
}

label {
font-weight: bold;
}

input[type="password"] {
padding: 5px;
border: 1px solid #ccc;
border-radius: 4px;
width: 100%; /* Ensure input takes full width */
}

button {
background-color: #4CAF50;
color: white;
padding: 5px 10px;
border: none;
border-radius: 4px;
cursor: pointer;
width: 100%; /* Make button full width on smaller screens */
}

/* Mobile-friendly adjustments */
@media (max-width: 600px) {
body {
padding: 10px; /* Adjust body padding for smaller screens */
}

form {
gap: 15px; /* Increase the gap between form elements on small screens */
}

input[type="password"] {
padding: 10px; /* Increase padding inside the password field */
}

button {
padding: 10px 15px; /* Adjust button padding for better usability */
}
}
</style>
</head>
<script>
function formsubmitted(e){
         e.preventDefault();
        console.log('called')
             }
</script>
<form action="/password/updatepassword/${id}" method="get">
<label for="newpassword">Enter New password</label>
<input name="newpassword" type="password" required></input>
<button>reset password</button>
</form>
</html>
      `);
  } catch (error) {
      console.error("Error in resetpassword route:", error);
      res.status(500).send("An error occurred.");
  }
};


const updatepassword = async (req, res) => {
  try {
      const { newpassword } = req.query;
      const resetpasswordid = req.params.resetpasswordid;

      const resetPasswordRequest = await Forgotpassword.findOne({ id: resetpasswordid });

      if (!resetPasswordRequest || resetPasswordRequest.isExpired) {
          return res.status(404).json({ error: 'Reset password request not found or expired', success: false });
      }

      const user = await User.findOne({ _id: resetPasswordRequest.userId });

      if (!user) {
          return res.status(404).json({ error: 'No user exists', success: false });
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newpassword, saltRounds);

      await User.updateOne({ _id: user._id }, { password: hashedPassword });

      return res.status(201).json({ message: 'Successfully updated the new password' });
  } catch (error) {
      console.error('Error updating password:', error);
      return res.status(500).json({ error: 'Failed to update password', success: false, details: error.message });
  }
};

module.exports = {
  forgotpassword,
  updatepassword,
  resetpassword,
};

