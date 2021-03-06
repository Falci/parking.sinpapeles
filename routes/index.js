const express = require('express');
const router = express.Router();
const api = require('./api');
const update = require('./update');
const {
    updateViews,
    isPrice,
    getPunyCode,
    getSubdomainSuggestion,
    getName,
    updateClicks,
    list,
    richContact,
} = require('../utils');

router.use('/api', api);
router.use(update);

const index = async (h, req, res) => {
    const host = encodeURIComponent(h);
    const data = await getName(host);

    if (data && data.contact) {
        const hasPrice = isPrice(data.value);
        const punyCode = getPunyCode(host);

        updateViews(host);

        res.render('parking', {
            host,
            hasPrice,
            seller: data.seller,
            price: data.value,
            gaCode: data.ga_code,
            punyCode,
            content: data.content,
            stats: {
                clicks: data.clicks,
                views: data.views,
            },
        });
    } else {
        res.render('missing', {
            host,
            suggestion: getSubdomainSuggestion(host),
        });
    }
};

router.get('/', async (req, res, next) => {
    const host = req.get('host').replace(/^www\./, '');

    if (['parking.sinpapeles', 'parking.sinpapeles.xyz', 'localhost:2000'].includes(host)) {
        next();
        return;
    }

    index(host, req, res);
});

router.get('/domain/:host', (req, res) => {
    const { host } = req.params;

    index(host, req, res);
});

router.get('/contact/:host', async (req, res) => {
    const host = encodeURIComponent(req.params.host);
    const data = await getName(host);

    if (data && data.contact) {
        updateClicks(host);
        return res.redirect(richContact(data.contact, host));
    }

    res.redirect('/');
});

router.get('/', (req, res) => {
    const { query } = req;
    const { page, start, search, seller } = query;
    const data = list({
        page: parseInt(page || 1),
        start: encodeURIComponent(start || ''),
        search: encodeURIComponent(search || ''),
        seller: encodeURIComponent(seller || ''),
    });

    res.render('list', { ...data, query });
});

router.get('/about', (_, res) => res.render('about'));
router.get('/donate', (_, res) => res.render('donate'));
router.get('/swap', (_, res) => res.render('swap'));

module.exports = router;
