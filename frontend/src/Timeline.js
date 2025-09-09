import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Header from './Header';
import Copyright from './Copyright';
import './Timeline.css'; // Import the CSS file

// Define the Timeline component
const Timeline = () => {
  const [timelineData, setTimelineData] = useState([]);

  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/timeline/`);
        if (response.ok) {
          const data = await response.json();
          setTimelineData(data);
        } else {
          throw new Error('Failed to fetch timeline data');
        }
      } catch (error) {
        console.error('Error fetching timeline data:', error);
      }
    };

    fetchTimelineData();
  }, []);

  return (
    <div>
      <div>
        <Header />
      </div>
      <div className="timeline-container"> {/* Apply container class */}
        <TableContainer component={Paper}>
          <Table className="timeline-table" size="small" aria-label="a dense table"> {/* Apply table class */}
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell align="right">Description</TableCell>
                <TableCell align="right">Team</TableCell>
                <TableCell align="right">Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {timelineData.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.title}
                  </TableCell>
                  <TableCell align="right">{row.description}</TableCell>
                  <TableCell align="right">{row.team}</TableCell>
                  <TableCell align="right">{row.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      <Copyright />
    </div>
  );
};

export default Timeline;
