import React from "react";
import { Grid, Paper, Typography, Box } from "@mui/material";
import AutoStoriesIcon from "@mui/icons-material/AutoStories"; // Book icon
import PeopleIcon from "@mui/icons-material/People";
import CategoryIcon from "@mui/icons-material/Category";
import LanguageIcon from "@mui/icons-material/Language";
import { Button } from "@mui/material";

function HomePage() {
  const stats = [
    {
      label: "Total Books",
      value: "100K+",
      icon: <AutoStoriesIcon color="primary" />,
    },
    {
      label: "Active Members",
      value: "25k+",
      icon: <PeopleIcon color="primary" />,
    },
    {
      label: "Research Genres",
      value: "15+",
      icon: <CategoryIcon color="primary" />,
    },
    {
      label: "Digital Access",
      value: "24/7",
      icon: <LanguageIcon color="primary" />,
    },
  ];
  return (
    <div className="Home-main">
      <div className="container">
        <h1 className="loraFont" style={{ fontWeight: "550" }}>
          Welcome to <spam className="gradient-text-welcome">libra360°</spam>
        </h1>
        <div className="content-text" style={{ marginBottom: "40px" }}>
          <p>
            Our library management service caters to libraries, schools,
            organizations, and home catalogs. Our online software lets you
            create multiple collections, catalog books, board games, movies,
            music, and video games, create tags, leave notes, import/export,
            share your collections and much more. We offer two different
            subscription options to best fit your needs. Libib is the best place
            for cataloging and managing your media available online. Now which
            version is the best for you?
          </p>
        </div>
      </div>

      <div style={{ backgroundColor: "ButtonShadow" }}>
        <div className="container">
          <div className="p-3 ">
            <h2 style={{ fontWeight: "550" }}>Explore our Collections</h2>
            <Grid
              container
              spacing={3}
              sx={{ mt: 2, mb: 4 }}
              className="mb-4 d-flex justify-content-center"
            >
              {stats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: "center",
                      minWidth: 200,
                      borderRadius: 4,
                      border: "1px solid #e0e0e0",
                      transition: "0.3s",
                      "&:hover": {
                        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                        transform: "translateY(-5px)",
                      },
                    }}
                  >
                    <Box
                      sx={{ mb: 1, display: "flex", justifyContent: "center" }}
                    >
                      {stat.icon}
                    </Box>
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {stat.value}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontWeight="500"
                    >
                      {stat.label}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </div>
        </div>
      </div>
      <div>
        <div className="container">
          <Box sx={{ padding: { xs: "10px", md: "20px" } }}>
            <Typography
              variant="overline"
              color="primary"
              fontWeight="bold"
              gutterBottom
            >
              Our Premises
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              fontWeight="800"
              gutterBottom
            >
              A World-Class Environment for Knowledge
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ lineHeight: 1.8, mb: 3 }}
            >
              Our library offers a sprawling 15,000 sq. ft. facility designed
              for both deep focus and collaborative learning. With over 100K+
              printed volumes and high-speed digital zones, we provide the
              perfect atmosphere for students, researchers, and book lovers
              alike.
            </Typography>

            <Button
              variant="contained"
              className="explore-facilities-button"
              size="large"
              sx={{ borderRadius: "8px", textTransform: "none" }}
            >
              Explore Facilities
            </Button>
          </Box>
        </div>
      </div>
      <div className="container mt-4">
        <div className="division-line">
          <div>
            <img src="src/image/image 1.jpg" alt="Library Books" />
          </div>

          <div className="content-box">
            <h2>Well-Stocked Book Collection</h2>
            <p>
              Our library offers a rich collection of academic, technical, and
              reference books. Students can access textbooks, journals, and
              competitive exam materials in a calm and organized environment
              that supports focused learning.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2 */}
      <div>
        <div className="container">
          <div className="division-line-reverse">
            <div>
              <img src="src/image/image 2.jpg" alt="Reading Area" />
            </div>

            <div className="content-box">
              <h2>Comfortable Reading Area</h2>
              <p>
                The reading area is designed for comfort and concentration.
                Spacious seating, proper lighting, and a peaceful atmosphere
                help students study effectively and make the most of their
                library time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
