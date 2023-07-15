const router = require('express').Router();
const { User, Post, UserFollow } = require('../../models');
const { findAll } = require('../../models/User');
const withAuth = require('../../utils/withAuth')

router.get('/', async (req, res) => {
    try {
        const userData = await User.findAll({
            include: [
                {
                    model: Post,
                    attributes: []
                },
                'following',
                'follower'
            ]
        });

    if (!userData) {
        return res.status(404).json({
            message: "No users found"
        })
    }

    res.status(200).json(userData)
    } catch (err) {
        return res.status(500).json(err)
    }
});

router.get('/dev/userfollow', async (req, res) => {
    const allData = await UserFollow.findAll();

    res.status(200).json(allData)
})

router.post('/follow/:name', withAuth, async (req, res) => {

    console.log(req.session)

    try {

        if (!req.session.logged_in) {
            res.status(401).redirect('/')
            return
        }

        const followUser = await User.findOne({
            where: {username: req.body.username}
        })

        const following = followUser.toJSON();
        
        console.log(following)


        const followData = await UserFollow.create({
            user_id: req.session.user_id,
            follow_user_id: following.id
        })

        // const userFollow = await UserFollow.create({
        //     user_id: req.session.user_id,
        //     follow_user_id: following.id
        // });


        // console.log(userFollow)

        res.status(200).json(followData)

    } catch (err) {
        res.status(500).json(err)
    }
})

router.post('/signup', async (req, res) => {
    console.log(req)
    try {
      const userData = await User.create(req.body);

      req.session.save(() => {
        req.session.user_id = userData.id;
        req.session.logged_in = true;
  
        res.status(200).json(userData);
      });
    } catch (err) {
      res.status(400).json(err);
    }
});

router.post('/login', async (req, res) => {
    console.log(req.body)
    try {
      const userData = await User.findOne({ where: { email: req.body.email } });
  
      if (!userData) {
        res
          .status(400)
          .json({ message: 'Incorrect email or password, please try again' });
        return;
      }
      
  
      const validPassword = await userData.checkPassword(req.body.password);
  
      if (!validPassword) {
        res
          .status(400)
          .json({ message: 'Incorrect email or password, please try again' });
        return;
      }
  
      req.session.save(() => {
        req.session.user_id = userData.id;
        req.session.logged_in = true;
        
        res.json({ user: userData, message: 'You are now logged in!' });
      });
  
    } catch (err) {
      res.status(400).json(err);
    }
});
    
router.post('/logout', (req, res) => {
if (req.session.logged_in) {
    req.session.destroy(() => {
    res.status(204).end();
    });
} else {
    res.status(404).end();
}
});
  

module.exports = router;