"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDefaultData = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const app_1 = require("../app");
const DEFAULT_POLICIES = [
    {
        name: 'Detect PowerShell Execution',
        rule: { field: 'process', operator: 'equals', value: 'powershell.exe' },
        isActive: true,
        mitreTactic: 'Execution',
        mitreTechniqueId: 'T1059',
        mitreTechniqueName: 'Command and Scripting Interpreter',
    },
    {
        name: 'Suspicious Network Connection',
        rule: { field: 'dest_ip', operator: 'contains', value: '45.33' },
        isActive: true,
        mitreTactic: 'Command and Control',
        mitreTechniqueId: 'T1071',
        mitreTechniqueName: 'Application Layer Protocol',
    },
    {
        name: 'Passwd File Access',
        rule: { field: 'file', operator: 'contains', value: '/etc/passwd' },
        isActive: true,
        mitreTactic: 'Credential Access',
        mitreTechniqueId: 'T1003',
        mitreTechniqueName: 'OS Credential Dumping',
    },
    {
        name: 'Detect PsExec Usage',
        rule: { field: 'process', operator: 'equals', value: 'psexec.exe' },
        isActive: true,
        mitreTactic: 'Lateral Movement',
        mitreTechniqueId: 'T1570',
        mitreTechniqueName: 'Lateral Tool Transfer',
    },
    {
        name: 'Sensitive File Access (Shadow)',
        rule: { field: 'command', operator: 'contains', value: '/etc/shadow' },
        isActive: true,
        mitreTactic: 'Credential Access',
        mitreTechniqueId: 'T1003',
        mitreTechniqueName: 'OS Credential Dumping',
    },
    {
        name: 'SSH Auth Failure Spike',
        rule: { field: 'type', operator: 'equals', value: 'AUTH_FAILURE' },
        isActive: true,
        mitreTactic: 'Credential Access',
        mitreTechniqueId: 'T1110',
        mitreTechniqueName: 'Brute Force',
    },
];
const ensureDefaultData = async () => {
    const adminPassword = await bcrypt_1.default.hash('Admin123!', 10);
    await app_1.prisma.user.upsert({
        where: { email: 'admin@cortex.com' },
        update: {
            password: adminPassword,
            role: 'ADMIN',
            name: 'Admin User',
        },
        create: {
            email: 'admin@cortex.com',
            password: adminPassword,
            name: 'Admin User',
            role: 'ADMIN',
        },
    });
    for (const policy of DEFAULT_POLICIES) {
        await app_1.prisma.policy.upsert({
            where: { name: policy.name },
            update: {
                isActive: true,
                rule: policy.rule,
                mitreTactic: policy.mitreTactic,
                mitreTechniqueId: policy.mitreTechniqueId,
                mitreTechniqueName: policy.mitreTechniqueName,
            },
            create: policy,
        });
    }
};
exports.ensureDefaultData = ensureDefaultData;
