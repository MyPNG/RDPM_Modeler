import React from "react";
import { Box, TextField, Autocomplete } from "@mui/material";


const FilterBar = ({ filterOptions, onFilterChange, label }) => {
  return (
    <Box sx={{ marginBottom: 2 }}>
      <Autocomplete
        disablePortal
        options={filterOptions}
        sx={{ width: 300 }}
        onChange={(event, value) => onFilterChange(value)} 
        renderInput={(params) => <TextField {...params} label={label} />}
      />
    </Box>
  );
};

export default FilterBar;