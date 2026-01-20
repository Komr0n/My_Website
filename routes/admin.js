const express = require('express');
const router = express.Router();
const { 
    getDashboard, 
    manageAbout, 
    updateAbout,
    uploadAvatar,
    manageProjects, 
    addProject, 
    createProject,
    editProject,
    updateProject,
    deleteProject,
    manageCertificates,
    uploadCertificate,
    addCertificate,
    deleteCertificate,
    managePosts,
    addPost,
    createPost,
    editPost,
    updatePost,
    deletePost,
    uploadPostImage,
    uploadEditorImage,
    uploadEditorImageHandler,
    getMessages
} = require('../controllers/adminController');

// Dashboard
router.get('/', getDashboard);

// About management
router.get('/about', manageAbout);
router.put('/about', uploadAvatar, updateAbout);

// Project management
router.get('/projects', manageProjects);
router.get('/projects/new', addProject);
router.post('/projects', createProject);
router.get('/projects/:id/edit', editProject);
router.put('/projects/:id', updateProject);
router.delete('/projects/:id', deleteProject);

// Certificate management
router.get('/certificates', manageCertificates);
router.post('/certificates', uploadCertificate, addCertificate);
router.delete('/certificates/:id', deleteCertificate);

// Post management
router.get('/posts', managePosts);
router.get('/posts/new', addPost);
router.post('/posts', uploadPostImage, createPost);
router.get('/posts/:id/edit', editPost);
router.put('/posts/:id', uploadPostImage, updatePost);
router.delete('/posts/:id', deletePost);
router.post('/posts/upload-image', uploadEditorImage, uploadEditorImageHandler);

// Messages
router.get('/messages', getMessages);

module.exports = router;


