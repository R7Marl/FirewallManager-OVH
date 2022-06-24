const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../lib/auth');
const pool = require('../database');
let { promisify } = require('util');
let axios = require('axios');
const { isadmin } = require('../lib/isadmin');
const ovh = require('ovh')({
    endpoint: 'ovh-ca',
    appKey: '1nBK692Nh90IMdWR',
    appSecret: 'NxbOuqySCH9azaZKFQ5JhG2Thn1lKgh3',
    consumerKey: 'ZFHdVo5gn64LwBe2i7AN6XHzjIbBRGmQ'
});
router.get('/', async (req, res) => {
    res.redirect('/dashboard');
});
router.get('/dashboard', isLoggedIn, async(req, res) => {
    const { email } = req.user;
    const servers = await pool.query('SELECT * FROM servers WHERE owner = ?', [email])
    var hostname;
    var alerts = [];
 ovh.re = promisify(ovh.request);
    console.log(servers)
    if(servers.length >  0){
        console.log(servers);
        res.render('dashboard', {
            servers,
            user: req.user.email
        })
    } else {
        res.render('dashboard', { servers: [] });
    }
})

router.get('/server/:ip/game', isLoggedIn, async(req,res) => {
    const { ip } = req.params;
    const { email } = req.user;
    let gamefirewall = [];
    ovh.re = promisify(ovh.request);
    const server = await pool.query('SELECT * FROM servers WHERE ip = ? AND owner = ?', [ip, email])
    console.log(server)
    
    if(server.length > 0){
        if(server[0].type === 'Path Network') {
            req.flash('message', 'No se puede acceder a un servidor Path Network por el momento.');
            res.redirect('/dashboard');
        }
        const buildUrl = `https://control-vps.suitedhosting.com:4083/index.php` /*    <td>{{cores}}</td>
        <td>{{ram}} GB</td>
        <td>{{disk}} GB</td>
        <td>{{speed}}</td>
        <td>{{bandwidth}}*/
        axios.get(buildUrl, {
                params: {
                    act: 'vpsmanage',
                    svs: server[0].vpsid,
                    api: 'json',
                    apikey: 'D5LQL7ZVJBXZ9UE4',
                    apipass: 'b8u6d3svj3rzrrbanca8klzvqzjn1tsi'
                }
            })
            .then((result) => {
                return result.data
            })
            .then(async(result) => {
                let a = await ovh.re('GET', `/ip/${encodeURIComponent(server[0].IPBlock)}/game/${server[0].IP}/rule`);
                for (let i = 0; i < a.length; i++) {
                    const element = a[i];
                   let n= await ovh.re('GET', `/ip/${encodeURIComponent(server[0].IPBlock)}/game/${server[0].IP}/rule/${element}`);
                   console.log(n);
                    gamefirewall.push(n);
                }
                console.log(gamefirewall);
        
                res.render('servers', {
                    gamefirewall,
                    user: email,
                    IP: ip,
                    hostname: await ovh.re('GET', `/ip/${encodeURIComponent(server[0].IPBlock)}/reverse/${server[0].IP}`),
                    cores: result.info.vps.cores,
                    ram: result.info.vps.ram,
                    disk: result.info.vps.space,
                    speed: result.info.vps.network_speed,
                    bandwidth: result.info.vps.bandwidth.used
                });
            })
            .catch((err) => {
                console.log(err);
            })
        
    } else {
        req.flash('message', 'Hubo un error.')
        res.redirect('/dashboard')
    }
})
router.get('/server/:ip/firewall', isLoggedIn, async(req, res) => {
    let { ip } = req.params;
    const { email } = req.user;
    let firewall = [];
    ovh.re = promisify(ovh.request);
    const server = await pool.query('SELECT * FROM servers WHERE ip = ? AND owner = ?', [ip, email])
    console.log(server)
    if(server.length > 0){
        if(server[0].type === 'Path Network') {
            req.flash('message', 'No se puede acceder a un servidor Path Network por el momento.');
            res.redirect('/dashboard');
        }
        const buildUrl = `https://control-vps.suitedhosting.com:4083/index.php`
        axios.get(buildUrl, {
                params: {
                    act: 'vpsmanage',
                    svs: server[0].vpsid,
                    api: 'json',
                    apikey: 'D5LQL7ZVJBXZ9UE4',
                    apipass: 'b8u6d3svj3rzrrbanca8klzvqzjn1tsi'
                }
            })
            .then((result) => {
                return result.data
            })
            .then(async(result) => {
                let a = await ovh.re('GET', `/ip/${encodeURIComponent(server[0].IPBlock)}/firewall/${server[0].IP}/rule`);
                for (let i = 0; i < a.length; i++) {
                    const element = a[i];
                   let n= await ovh.re('GET', `/ip/${encodeURIComponent(server[0].IPBlock)}/firewall/${server[0].IP}/rule/${element}`);
                   console.log(n);
                    firewall.push(n);
                }
                console.log(firewall);
        
                res.render('servers2', {
                    firewall,
                    user: email,
                    IP: ip,
                    hostname: await ovh.re('GET', `/ip/${encodeURIComponent(server[0].IPBlock)}/reverse/${server[0].IP}`),
                    cores: result.info.vps.cores,
                    ram: result.info.vps.ram,
                    disk: result.info.vps.space,
                    speed: result.info.vps.network_speed,
                    bandwidth: result.info.vps.bandwidth.used
                });
            })
        } else {
            req.flash('message', 'Hubo un error.')
            res.redirect('/dashboard')
        }
})
router.post('/server/:ip/game/add', isLoggedIn, async(req, res) => {
    const { ip } = req.params;
    const { email } = req.user;
    const { protocol, startport, endport } = req.body;
    console.log(req.body)
    const server = await pool.query('SELECT * FROM servers WHERE ip = ? AND owner = ?', [ip, email])
    console.log(server);
    if(server.length > 0){
      ovh.request('POST', `/ip/${encodeURIComponent(server[0].IPBlock)}/game/${server[0].IP}/rule`, {
       ports: { from: startport, to: endport },
       protocol: protocol
      }, function(error, result) {
        if (error) {
          console.log(error);
          req.flash('message', 'Error from OVH: '+ error);
          res.redirect('/server/'+ip+'/game');
        } else {
          console.log(result);
          req.flash('success', 'Rule Added Successfully.')
          res.redirect(`/server/${ip}/game`)
        }
      })
    } else {
        req.flash('message', 'IP not found.')
        res.redirect('/dashboard')
    }
});
router.post('/server/:ip/game/delete', isLoggedIn, async(req, res) => {
    const { ip } = req.params;
    const { email } = req.user;
    const { id } = req.body;
    console.log(req.body)
    const server = await pool.query('SELECT * FROM servers WHERE ip = ? AND owner = ?', [ip, email])
    console.log(server);
    if(server.length > 0){
        ovh.request('DELETE', `/ip/${encodeURIComponent(server[0].IPBlock)}/game/${server[0].IP}/rule/${id}`, {
        }, function(error, result) {
            if (error) {
                console.log(error);
                req.flash('message', 'Error from OVH: '+ error);
                res.redirect('/server/'+ip+'/game');
            } else {
                console.log(result);
                req.flash('success', 'Rule Deleted Successfully.')
                res.redirect(`/server/${ip}/game`)
            }
        })
    } else {
        req.flash('message', 'IP not found.')
        res.redirect('/dashboard')
    }
});
router.post('/server/:ip/hostname', isLoggedIn, async(req, res) => {
    const { ip } = req.params;
    const { email } = req.user;
    const { hostname } = req.body;
    console.log(req.body)
    const server = await pool.query('SELECT * FROM servers WHERE ip = ? AND owner = ?', [ip, email])
    console.log(server);
    if(server.length > 0){
        ovh.request('POST', `/ip/${encodeURIComponent(server[0].IPBlock)}/reverse`, {
            ipReverse: ip,
            reverse: hostname
        }, function(error, result) {
            if (error) {
                console.log(error);
                req.flash('message', 'Error from OVH: '+ error);
                res.redirect('/server/'+ip+'/game');
            } else {
                console.log(result);
                req.flash('success', 'Hostname Updated Successfully.')
                res.redirect(`/server/${ip}/game`)
            }
        })
    } else {
        req.flash('message', 'IP not found.')
        res.redirect('/dashboard')
    }
});
router.get('/cualquiera', (req, res) => {
    const buildUrl = `https://control-vps.suitedhosting.com:4083/index.php`
        axios.get(buildUrl, {
                params: {
                    act: 'vpsmanage',
                    svs: '50',
                    api: 'json',
                    apikey: 'D5LQL7ZVJBXZ9UE4',
                    apipass: 'b8u6d3svj3rzrrbanca8klzvqzjn1tsi'
                }
            })
            .then((result) => {
                return result.data
            })
            .then((result) => {
                console.log(result.info)
                res.send(`<p>RAM: ${result.info.vps.ram}</p> <p>Cores: ${result.info.vps.cores}</p> <p>Space: ${result.info.vps.space}</p> <p>Bandwidth: ${result.info.bandwidth.used}</p> <p>OS: ${result.info.os.name}</p>`)
            })
            .catch((err) => {
                console.log(err);
            })
})

router.get('/admin', isadmin, async(req, res) => {
let servers = await pool.query('SELECT * FROM servers');
let users = await pool.query('SELECT * FROM users');
res.render('admin/admin', {
    servers,
    users
})
})

router.post('/admin/new/server', isadmin, async(req, res) => {
    const { IP, user, IPBlock, type, fwgame, fw, vencimiento } = req.body;
    const server = await pool.query('SELECT * FROM servers WHERE ip = ?', [IP]);
    if(server.length > 0){
        req.flash('message', 'IP already exists.')
        res.redirect('/admin')
    } else {

        await pool.query('INSERT INTO servers (IPBlock, IP, owner, type, firewallgame, firewall, created, vencimiento) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [IPBlock, IP, user, type, fwgame, fw, new Date(), vencimiento]);
        req.flash('success', 'Server Added Successfully.')
        res.redirect('/admin')
    }
});
router.post('/server/:ip/install/mysql', isLoggedIn, async(req, res) => {
    const { ip } = req.params;
    const { email } = req.user;
    const { password } = req.body;
    const { username } = req.body;
    console.log(req.body)
    const server = await pool.query('SELECT * FROM servers WHERE ip = ? AND owner = ?', [ip, email])
    console.log(server);
    if(server.length > 0){
 const {NodeSSH} = require('node-ssh')
const ssh = new NodeSSH()

ssh.connect({
  host: ip,
  username: username,
  password: password
})
        ssh.execCommand('apt update -y && apt install mysql-server -y', { cwd:'/var/www' }).then(function(result) {
           if(result.stderr) {
            console.log(result.stderr)
            req.flash('message', 'Error:'+ result.stderr);
            res.redirect('/server/'+ip+'/game');
           }
           req.flash('success', 'MySQL Installed Successfully.')
           res.redirect('/server/'+ip+'/game');

          })

    }


})
module.exports = router;