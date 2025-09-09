// Copyright.js

import React from 'react';
import './Copyright.css'; // Import the CSS file

const Copyright = () => {
    return (
        <footer className="footer">
            <p>&copy; {new Date().getFullYear()} Queens Hyperloop Design Team. All rights reserved.</p>
        </footer>
    );
}

export default Copyright;
