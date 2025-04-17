import express from 'express';
import { v4 as uuid } from 'uuid';
import { Resend } from 'resend';
import { User } from '../models/associations.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// Request magic link
router.post('/magic-link', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Generate a unique token
    const magicToken = uuid();
    const magicTokenCreatedAt = new Date();
    
    // Find or create user
    let user = await User.findOne({ where: { email } });
    
    // Check if this is the admin email
    const isAdmin = email === process.env.ADMIN_EMAIL;
    
    if (user) {
      // Update existing user
      await user.update({ 
        magicToken, 
        magicTokenCreatedAt,
        isAdmin // Update admin status in case it changed
      });
    } else {
      // Create new user
      user = await User.create({
        email,
        magicToken,
        magicTokenCreatedAt,
        isAdmin
      });
    }
    
    // Generate magic link URL
    const magicLinkUrl = `${process.env.MAGIC_LINK_URL}?token=${magicToken}`;
    
    // Send email with magic link
    await resend.emails.send({
      from: 'onboarding@ava-protocol.com',
      to: email,
      subject: 'Your Login Link for Todo App',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Login to Todo App</h2>
          <p>Click the link below to log in:</p>
          <a href="${magicLinkUrl}" style="display: inline-block; background: #4F46E5; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin: 20px 0;">
            Log in to Todo App
          </a>
          <p>This link will expire in 10 minutes and can only be used once.</p>
          <p>If you didn't request this link, you can safely ignore this email.</p>
        </div>
      `,
    });
    
    res.json({ message: 'Magic link sent to your email' });
  } catch (error) {
    console.error('Magic link error:', error);
    res.status(500).json({ message: 'Error sending magic link', error: error.message });
  }
});

// Verify magic link token
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }
    
    // Find user with this token
    const user = await User.findOne({ where: { magicToken: token } });
    
    if (!user) {
      return res.status(404).json({ message: 'Invalid or expired token' });
    }
    
    // Check if token is expired (10 minutes validity)
    const tokenCreatedAt = new Date(user.magicTokenCreatedAt);
    const now = new Date();
    const tokenAgeInMs = now - tokenCreatedAt;
    const tokenMaxAgeInMs = 10 * 60 * 1000; // 10 minutes
    
    if (tokenAgeInMs > tokenMaxAgeInMs) {
      return res.status(401).json({ message: 'Token has expired' });
    }
    
    // Clear token after successful verification
    await user.update({
      magicToken: null,
      magicTokenCreatedAt: null
    });
    
    // Return user info without sensitive data
    res.json({
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Error verifying token', error: error.message });
  }
});

export default router; 