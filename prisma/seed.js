"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var client_1 = require("@prisma/client");
var adapter_pg_1 = require("@prisma/adapter-pg");
var bcryptjs_1 = __importDefault(require("bcryptjs"));
var adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL });
var prisma = new client_1.PrismaClient({ adapter: adapter });
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var universalPassword, passwordOwner, passwordDgm, passwordFinance, passwordAccountant, passwordTax, mesael, dembi, leta, kalkidan, yamrot, firehiwot, samuel, john, admin, boleProject, cmcProject, cc2201, cc4102, supplier1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Seeding initial enterprise data...');
                    return [4 /*yield*/, bcryptjs_1.default.hash('1234', 10)];
                case 1:
                    universalPassword = _a.sent();
                    passwordOwner = universalPassword;
                    passwordDgm = universalPassword;
                    passwordFinance = universalPassword;
                    passwordAccountant = universalPassword;
                    passwordTax = universalPassword;
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'mesael@mesael.et' },
                            update: { password: passwordOwner },
                            create: {
                                email: 'mesael@mesael.et',
                                name: 'Mesael',
                                roleId: 'mesael',
                                title: 'Owner / CEO',
                                avatar: 'MS',
                                password: passwordOwner,
                            },
                        })];
                case 2:
                    mesael = _a.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'dembi@mesael.et' },
                            update: { password: passwordDgm },
                            create: {
                                email: 'dembi@mesael.et',
                                name: 'Dembi',
                                roleId: 'dembi',
                                title: 'Deputy GM',
                                avatar: 'DG',
                                password: passwordDgm,
                            },
                        })];
                case 3:
                    dembi = _a.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'leta@mesael.et' },
                            update: { password: passwordFinance },
                            create: {
                                email: 'leta@mesael.et',
                                name: 'Leta',
                                roleId: 'leta',
                                title: 'Operational Finance',
                                avatar: 'LG',
                                password: passwordFinance,
                            },
                        })];
                case 4:
                    leta = _a.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'kalkidan@mesael.et' },
                            update: { password: passwordAccountant },
                            create: {
                                email: 'kalkidan@mesael.et',
                                name: 'Kalkidan',
                                roleId: 'kalkidan',
                                title: 'Accountant',
                                avatar: 'KA',
                                password: passwordAccountant,
                            },
                        })];
                case 5:
                    kalkidan = _a.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'yamrot@mesael.et' },
                            update: { password: passwordTax },
                            create: {
                                email: 'yamrot@mesael.et',
                                name: 'Yamrot Tufa',
                                roleId: 'yamrot',
                                title: 'Billing & Tax Compliance',
                                avatar: 'YB',
                                password: passwordTax,
                            },
                        })];
                case 6:
                    yamrot = _a.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'firehiwot@mesael.et' },
                            update: { password: universalPassword },
                            create: {
                                email: 'firehiwot@mesael.et',
                                name: 'Firehiwot',
                                roleId: 'firehiwot',
                                title: 'Office Engineer',
                                avatar: 'FH',
                                password: universalPassword,
                            },
                        })];
                case 7:
                    firehiwot = _a.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'samuel@mesael.et' },
                            update: { password: universalPassword },
                            create: {
                                email: 'samuel@mesael.et',
                                name: 'Samuel',
                                roleId: 'samuel',
                                title: 'Purchaser',
                                avatar: 'SM',
                                password: universalPassword,
                            },
                        })];
                case 8:
                    samuel = _a.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'john@mesael.et' },
                            update: { password: universalPassword },
                            create: {
                                email: 'john@mesael.et',
                                name: 'John',
                                roleId: 'john',
                                title: 'Site Engineer',
                                avatar: 'JH',
                                password: universalPassword,
                            },
                        })];
                case 9:
                    john = _a.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'admin@mesael.et' },
                            update: { password: universalPassword },
                            create: {
                                email: 'admin@mesael.et',
                                name: 'System Admin',
                                roleId: 'admin',
                                title: 'IT Administrator',
                                avatar: 'IT',
                                password: universalPassword,
                            },
                        })];
                case 10:
                    admin = _a.sent();
                    return [4 /*yield*/, prisma.project.upsert({
                            where: { code: 'PRJ-BOLE' },
                            update: {},
                            create: {
                                code: 'PRJ-BOLE',
                                name: 'Bole Ring Road Extension',
                                client: 'City Admin',
                            },
                        })];
                case 11:
                    boleProject = _a.sent();
                    return [4 /*yield*/, prisma.project.upsert({
                            where: { code: 'PRJ-CMC' },
                            update: {},
                            create: {
                                code: 'PRJ-CMC',
                                name: 'CMC Residential Superstructure',
                                client: 'Private Developer',
                            },
                        })];
                case 12:
                    cmcProject = _a.sent();
                    return [4 /*yield*/, prisma.costCode.upsert({
                            where: { code: 'CC-2201' },
                            update: {},
                            create: {
                                code: 'CC-2201',
                                name: 'Reinforcement Steel',
                                projectId: boleProject.id,
                                budget: 8500000,
                                committed: 1250000,
                            },
                        })];
                case 13:
                    cc2201 = _a.sent();
                    return [4 /*yield*/, prisma.costCode.upsert({
                            where: { code: 'CC-4102' },
                            update: {},
                            create: {
                                code: 'CC-4102',
                                name: 'Excavation & Earthworks',
                                projectId: boleProject.id,
                                budget: 4200000,
                                committed: 800000,
                            },
                        })];
                case 14:
                    cc4102 = _a.sent();
                    return [4 /*yield*/, prisma.supplier.upsert({
                            where: { tin: '0012938475' },
                            update: {},
                            create: {
                                legalName: 'Abyssinia Steel PLC',
                                tin: '0012938475',
                                vatStatus: 'REGISTERED',
                                bankDetails: JSON.stringify({ bank: 'CBE', account: '1000123456789' }),
                                status: 'APPROVED'
                            }
                        })];
                case 15:
                    supplier1 = _a.sent();
                    console.log('Seeding completed successfully!');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
