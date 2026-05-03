require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

app.use(cors({
    origin: '*', 
    credentials: true
}));

app.use(bodyParser.json());
app.use(express.json());

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}));


app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


function requireAdmin(req, res, next) {
    if (!req.session.user || !req.session.user.isAdmin) {
        return res.status(403).json({ message: 'Доступ заборонено' });
    }
    next();
}


app.get('/medicines', async (req, res) => {
    const { data, error } = await supabase
        .from('medecine')
        .select('*');

    if (error) return res.status(500).json({ message: error.message });

    res.json(data);
});

app.get('/medicine/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from('medecine')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return res.status(500).json({ message: error.message });

    res.json(data);
});

app.post('/add-medicine', requireAdmin, async (req, res) => {
    const newMedicine = req.body;

    const { data, error } = await supabase
        .from('medecine')
        .insert([newMedicine])
        .select();

    if (error) return res.status(500).json({ message: error.message });

    res.json({ message: 'Додано!', data });
});

app.put('/medicine/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;

    const { error } = await supabase
        .from('medecine')
        .update(req.body)
        .eq('id', id);

    if (error) return res.status(500).json({ message: error.message });

    res.json({ message: 'Оновлено!' });
});

app.delete('/medicine/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;

    const { error } = await supabase
        .from('medecine')
        .delete()
        .eq('id', id);

    if (error) return res.status(500).json({ message: error.message });

    res.json({ message: 'Видалено!' });
});

app.get('/report-data', requireAdmin, async (req, res) => {
    try {
        const { data: medicines, error: medError } = await supabase
            .from('medecine')
            .select('*');

        const { data: categories, error: catError } = await supabase
            .from('categories')
            .select('*');

        if (medError) return res.status(500).json({ message: medError.message });
        if (catError) return res.status(500).json({ message: catError.message });

        const report = [];
        let totalAllMedicines = 0;
        let maxCategoryValue = 0;

        categories.forEach(category => {

            const medicinesInCategory = medicines.filter(
                med => med.category_id == category.id
            );

            let categorySum = 0;

            medicinesInCategory.forEach(med => {
                categorySum += Number(med.stock_quantity);
            });

            totalAllMedicines += categorySum;

            if (categorySum > maxCategoryValue) {
                maxCategoryValue = categorySum;
            }

            report.push({
                categoryName: category.name,
                totalQuantity: categorySum,
                medicines: medicinesInCategory.map(med => ({
                    name: med.trade_name,
                    quantity: med.stock_quantity
                }))
            });
        });

        res.json({
            totalAllMedicines,
            maxCategoryValue,
            report
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


app.get('/categories', async (req, res) => {
    const { data, error } = await supabase
        .from('categories')
        .select('*');

    if (error) return res.status(500).json({ message: error.message });

    res.json(data);
});

const saltRounds = 10;

app.post('/register', async (req, res) => {
    const { login, password } = req.body;

    const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('login', login)
        .maybeSingle();

    if (existingUser) {
        return res.status(400).json({ message: 'Такий логін вже існує' });
    }

    const password_hash = await bcrypt.hash(password, saltRounds);

    const { error } = await supabase
        .from('users')
        .insert([{
            login,
            password_hash,
            is_admin: false
        }]);

    if (error) return res.status(500).json({ message: error.message });

    res.json({ message: 'Реєстрація успішна' });
});


app.post('/login', async (req, res) => {
    const { login, password } = req.body;

    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('login', login)
        .maybeSingle();

    if (error || !user) {
        return res.status(401).json({ message: 'Неправильний логін або пароль' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
        return res.status(401).json({ message: 'Неправильний логін або пароль' });
    }

    req.session.user = {
        id: user.id,
        login: user.login,
        isAdmin: user.is_admin
    };

    res.json({
        message: 'Вхід успішний',
        login: user.login,
        isAdmin: user.is_admin
    });
});

app.get('/me', (req, res) => {
    if (!req.session.user) {
        return res.json({ isAuth: false });
    }

    res.json({
        isAuth: true,
        isAdmin: req.session.user.isAdmin
    });
});

app.post('/send-message', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Спочатку увійдіть в акаунт' });
    }

    const { email, message } = req.body;

    const { error } = await supabase
        .from('messages')
        .insert([{
            email,
            message,
            user_login: req.session.user.login
        }]);

    if (error) {
        return res.status(500).json({ message: error.message });
    }

    res.json({ message: 'Повідомлення успішно надіслано!' });
});

app.get('/get-messages', requireAdmin, async (req, res) => {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        return res.status(500).json({ message: error.message });
    }

    res.json(data);
});


app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access the server at http://localhost:${PORT}`);
});