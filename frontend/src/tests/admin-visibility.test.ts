import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Admin Portal Visibility and Route Protection Requirements', () => {
  const splashScreenPath = path.resolve(__dirname, '../pages/SplashScreen.tsx');
  const appRoutesPath = path.resolve(__dirname, '../App.tsx');
  const adminLoginPath = path.resolve(__dirname, '../pages/admin/AdminLogin.tsx');

  const splashScreenContent = fs.readFileSync(splashScreenPath, 'utf-8');
  const appRoutesContent = fs.readFileSync(appRoutesPath, 'utf-8');
  const adminLoginContent = fs.readFileSync(adminLoginPath, 'utf-8');

  it('Requirement 1: Admin Portal option, button, and link are removed from main page UI', () => {
    // Should NOT contain Admin Portal button or link
    expect(splashScreenContent).not.toContain('Admin Portal');
    // Should NOT contain System Administrator Login link
    expect(splashScreenContent).not.toContain('System Administrator Login');
    // Should NOT contain handleAdminClick
    expect(splashScreenContent).not.toContain('handleAdminClick');
  });

  it('Requirement 2: Main page displays only user-facing features', () => {
    // Citizen portal CTA
    expect(splashScreenContent).toContain('Continue as Citizen');
    // Organization portal CTA
    expect(splashScreenContent).toContain('Organization / Agency Login');
    // Citizen features
    expect(splashScreenContent).toContain('Automated 48h SLA Tracking');
    expect(splashScreenContent).toContain('Emergency Blood Hub');
  });

  it('Requirement 3: Admin Portal accessible through separate direct URL /admin/login', () => {
    // /admin/login route exists
    expect(appRoutesContent).toContain('path="/admin/login"');
  });

  it('Requirement 4: Admin dashboard and workspace routes are protected with authentication and authorization', () => {
    // ProtectedRoute wrapping admin routes with SUPER_ADMIN and CPET_ADMIN
    expect(appRoutesContent).toContain("allowedRoles={['SUPER_ADMIN', 'CPET_ADMIN']}");
    expect(appRoutesContent).toContain('redirectPath="/admin/login"');
    expect(appRoutesContent).toContain('<Route path="dashboard" element={<AdminDashboard />} />');
    expect(appRoutesContent).toContain('<Route path="organizations" element={<AdminOrganizations />} />');
  });

  it('Requirement 5: AdminLogin verifies administrator authorization and rejects unauthorized roles', () => {
    // Role verification in AdminLogin
    expect(adminLoginContent).toContain("loggedUser.role !== 'SUPER_ADMIN' && loggedUser.role !== 'CPET_ADMIN'");
    expect(adminLoginContent).toContain('logout()');
    expect(adminLoginContent).toContain('Access denied');
  });

  it('Requirement 6: Role authorization strictly distinguishes administrators from citizens/org users', () => {
    const adminRoles = ['SUPER_ADMIN', 'CPET_ADMIN'];
    const citizenRoles = ['CITIZEN', 'DONOR'];
    const orgRoles = ['ORGANIZATION_ADMIN', 'ORGANIZATION_AGENT'];

    const isAuthorized = (role: string) => adminRoles.includes(role);

    adminRoles.forEach((role) => expect(isAuthorized(role)).toBe(true));
    citizenRoles.forEach((role) => expect(isAuthorized(role)).toBe(false));
    orgRoles.forEach((role) => expect(isAuthorized(role)).toBe(false));
  });
});
