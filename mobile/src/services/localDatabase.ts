import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocalUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  created_at: string;
}

export interface LocalIncome {
  id: string;
  user_id: string;
  month: number;
  year: number;
  amount: string;
  created_at: string;
  updated_at: string;
}

export interface LocalExpense {
  id: string;
  user_id: string;
  income_id?: string | null;
  name: string;
  amount: string;
  category: string;
  date: string;
  month: number;
  year: number;
  created_at: string;
  updated_at: string;
}

export interface LocalSummary {
  totalIncome: string;
  totalExpenses: string;
  remainingBalance: string;
  expenseCount: number;
  percentageSpent: number;
  isOverspent: boolean;
  isNearLimit: boolean;
  categoryBreakdown: Record<string, string>;
  month: number;
  year: number;
}

const USERS_KEY = '@local_db_users';
const INCOMES_KEY = '@local_db_incomes';
const EXPENSES_KEY = '@local_db_expenses';

function generateId(): string {
  return 'loc_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
}

function toFixed2(val: number | string): string {
  const num = typeof val === 'number' ? val : parseFloat(val);
  return isNaN(num) ? '0.00' : num.toFixed(2);
}

// Ensure default demo admin account is always ready
async function ensureSeedData(): Promise<LocalUser[]> {
  try {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    let users: LocalUser[] = raw ? JSON.parse(raw) : [];

    const hasAdmin = users.some(
      (u) =>
        u.email.toLowerCase() === 'admin' ||
        u.email.toLowerCase() === 'admin@budgettracker.com' ||
        u.name.toLowerCase() === 'admin'
    );

    if (!hasAdmin) {
      const defaultAdmin: LocalUser = {
        id: 'user_admin_default_id',
        name: 'admin',
        email: 'admin',
        passwordHash: 'admin00',
        created_at: new Date().toISOString(),
      };
      users.push(defaultAdmin);
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    return users;
  } catch {
    return [];
  }
}

export const localDb = {
  // --- AUTHENTICATION ---
  async login(emailOrName: string, password: string): Promise<{ success: boolean; data?: { user: any; token: string }; message?: string }> {
    const users = await ensureSeedData();
    const query = emailOrName.trim().toLowerCase();

    const user = users.find(
      (u) =>
        u.email.toLowerCase() === query ||
        u.name.toLowerCase() === query ||
        (query === 'admin' && (u.email === 'admin' || u.name === 'admin'))
    );

    if (!user) {
      return { success: false, message: 'Invalid username or password.' };
    }

    // Accept admin00 or admin for ease of testing
    const isValid =
      user.passwordHash === password ||
      (user.name === 'admin' && (password === 'admin00' || password === 'admin'));

    if (!isValid) {
      return { success: false, message: 'Invalid username or password.' };
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
    };

    return {
      success: true,
      data: {
        user: userData,
        token: `local_token_${user.id}_${Date.now()}`,
      },
    };
  },

  async register(name: string, email: string, password: string): Promise<{ success: boolean; data?: { user: any; token: string }; message?: string }> {
    const users = await ensureSeedData();
    const cleanEmail = email.trim().toLowerCase();

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const newUser: LocalUser = {
      id: generateId(),
      name: name.trim(),
      email: cleanEmail,
      passwordHash: password,
      created_at: new Date().toISOString(),
    };

    users.push(newUser);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));

    const userData = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      created_at: newUser.created_at,
    };

    return {
      success: true,
      data: {
        user: userData,
        token: `local_token_${newUser.id}_${Date.now()}`,
      },
    };
  },

  // --- INCOMES ---
  async getIncome(userId: string, month: number, year: number): Promise<LocalIncome | null> {
    try {
      const raw = await AsyncStorage.getItem(INCOMES_KEY);
      const incomes: LocalIncome[] = raw ? JSON.parse(raw) : [];
      return incomes.find((i) => i.user_id === userId && i.month === month && i.year === year) || null;
    } catch {
      return null;
    }
  },

  async setIncome(userId: string, month: number, year: number, amount: number | string): Promise<LocalIncome> {
    const raw = await AsyncStorage.getItem(INCOMES_KEY);
    let incomes: LocalIncome[] = raw ? JSON.parse(raw) : [];

    const numAmount = typeof amount === 'number' ? amount : parseFloat(amount);
    const formattedAmount = toFixed2(isNaN(numAmount) ? 0 : numAmount);
    const existingIndex = incomes.findIndex((i) => i.user_id === userId && i.month === month && i.year === year);

    let savedIncome: LocalIncome;
    if (existingIndex >= 0) {
      incomes[existingIndex].amount = formattedAmount;
      incomes[existingIndex].updated_at = new Date().toISOString();
      savedIncome = incomes[existingIndex];
    } else {
      savedIncome = {
        id: generateId(),
        user_id: userId,
        month,
        year,
        amount: formattedAmount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      incomes.push(savedIncome);
    }

    await AsyncStorage.setItem(INCOMES_KEY, JSON.stringify(incomes));
    return savedIncome;
  },

  // --- EXPENSES ---
  async getExpenses(userId: string, month: number, year: number, category?: string): Promise<LocalExpense[]> {
    try {
      const raw = await AsyncStorage.getItem(EXPENSES_KEY);
      const expenses: LocalExpense[] = raw ? JSON.parse(raw) : [];
      return expenses.filter(
        (e) =>
          e.user_id === userId &&
          e.month === month &&
          e.year === year &&
          (!category || category === 'ALL' || e.category === category)
      );
    } catch {
      return [];
    }
  },

  async createExpense(userId: string, data: { name: string; amount: number | string; category?: string; date?: string; month?: number; year?: number }): Promise<LocalExpense> {
    const raw = await AsyncStorage.getItem(EXPENSES_KEY);
    let expenses: LocalExpense[] = raw ? JSON.parse(raw) : [];

    const now = new Date();
    const month = data.month || now.getMonth() + 1;
    const year = data.year || now.getFullYear();
    const numAmount = typeof data.amount === 'number' ? data.amount : parseFloat(data.amount);

    const newExpense: LocalExpense = {
      id: generateId(),
      user_id: userId,
      name: data.name.trim(),
      amount: toFixed2(isNaN(numAmount) ? 0 : numAmount),
      category: data.category || 'OTHER',
      date: data.date || now.toISOString(),
      month,
      year,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    expenses.unshift(newExpense);
    await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
    return newExpense;
  },

  async updateExpense(userId: string, id: string, data: { name?: string; amount?: number | string; category?: string; date?: string }): Promise<LocalExpense> {
    const raw = await AsyncStorage.getItem(EXPENSES_KEY);
    let expenses: LocalExpense[] = raw ? JSON.parse(raw) : [];
    const index = expenses.findIndex((e) => e.id === id && e.user_id === userId);

    if (index === -1) {
      throw new Error('Expense not found');
    }

    if (data.name !== undefined) expenses[index].name = data.name.trim();
    if (data.amount !== undefined) {
      const numAmount = typeof data.amount === 'number' ? data.amount : parseFloat(data.amount);
      expenses[index].amount = toFixed2(isNaN(numAmount) ? 0 : numAmount);
    }
    if (data.category !== undefined) expenses[index].category = data.category;
    if (data.date !== undefined) expenses[index].date = data.date;
    expenses[index].updated_at = new Date().toISOString();

    await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
    return expenses[index];
  },

  async deleteExpense(userId: string, id: string): Promise<boolean> {
    const raw = await AsyncStorage.getItem(EXPENSES_KEY);
    let expenses: LocalExpense[] = raw ? JSON.parse(raw) : [];
    expenses = expenses.filter((e) => !(e.id === id && e.user_id === userId));
    await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
    return true;
  },

  // --- SUMMARY CALCULATION (Dynamic balance, never stored) ---
  async getSummary(userId: string, month: number, year: number): Promise<LocalSummary> {
    const income = await this.getIncome(userId, month, year);
    const expenses = await this.getExpenses(userId, month, year);

    const totalIncomeNum = income ? parseFloat(income.amount) : 0;
    let totalExpensesNum = 0;
    const categoryBreakdown: Record<string, string> = {};

    for (const exp of expenses) {
      const amt = parseFloat(exp.amount) || 0;
      totalExpensesNum += amt;

      const cat = exp.category || 'OTHER';
      const existing = parseFloat(categoryBreakdown[cat] || '0');
      categoryBreakdown[cat] = toFixed2(existing + amt);
    }

    const remainingBalanceNum = totalIncomeNum - totalExpensesNum;
    const percentageSpent = totalIncomeNum > 0 ? Math.round((totalExpensesNum / totalIncomeNum) * 100) : totalExpensesNum > 0 ? 100 : 0;

    return {
      totalIncome: toFixed2(totalIncomeNum),
      totalExpenses: toFixed2(totalExpensesNum),
      remainingBalance: toFixed2(remainingBalanceNum),
      expenseCount: expenses.length,
      percentageSpent,
      isOverspent: remainingBalanceNum < 0,
      isNearLimit: percentageSpent >= 80 && remainingBalanceNum >= 0,
      categoryBreakdown,
      month,
      year,
    };
  },
};
