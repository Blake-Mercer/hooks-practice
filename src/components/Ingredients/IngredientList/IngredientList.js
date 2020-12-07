import React from 'react';

import './IngredientList.css';

const IngredientList = React.memo((props) => {
  const { onIngredientClick, ingredients } = props;
  console.log('Rendering from List');
  return (
    <section className='ingredient-list'>
      <h2>Loaded Ingredients</h2>
      <ul>
        {ingredients.map((ig, index) => (
          <li key={index} onClick={() => onIngredientClick(index)}>
            <span>{ig.title}</span>
            <span>{ig.amount}x</span>
          </li>
        ))}
      </ul>
    </section>
  );
});

export default IngredientList;
