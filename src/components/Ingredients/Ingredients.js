import React, { useReducer, useCallback, useMemo } from 'react';

import IngredientForm from './IngredientForm/IngredientForm';
import IngredientList from './IngredientList/IngredientList';
import ErrorModal from '../UI/ErrorModal/ErrorModal';
import Search from './Search/Search';
import ConfirmationModal from '../UI/ConfirmationModal/ConfirmationModal';

// Trying to implement the Confirmation Modal before someone deletes a list item. I cannot figure out the logic currently.

const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case 'SET':
      return action.ingredients;
    case 'ADD':
      return [...currentIngredients, action.ingredient];
    case 'DELETE':
      return currentIngredients.filter((ing) => ing.id !== action.id);
    default:
      throw new Error('BRO TF??');
  }
};

const httpReducer = (curHttpState, action) => {
  switch (action.type) {
    case 'SEND':
      return { loading: true, error: null };
    case 'RESPONSE':
      return { ...curHttpState, loading: false };
    case 'ERROR':
      return { loading: false, error: action.errorMessage };
    case 'CLEAR':
      return { ...curHttpState, error: null };
    default:
      throw new Error('BRO TF??');
  }
};

const Ingredients = () => {
  // const [userIngredients, setUserIngredients] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState();
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const [httpState, dispatchHttp] = useReducer(httpReducer, {
    loading: false,
    error: null,
  });

  const filterIngredientsHandler = useCallback((filterIngredients) => {
    // setUserIngredients(filterIngredients);
    dispatch({ type: 'SET', ingredients: filterIngredients });
  }, []);

  const addIngredientHandler = useCallback((ingredient) => {
    dispatchHttp({ type: 'SEND' });
    fetch(
      'https://hooks-intro-51b69-default-rtdb.firebaseio.com/ingredients.json',
      {
        method: 'POST',
        body: JSON.stringify(ingredient),
        headers: { 'Content-Type': 'application/json' },
      }
    )
      .then((res) => {
        dispatchHttp({ type: 'RESPONSE' });
        return res.json();
      })
      .then((resData) => {
        // setUserIngredients((prevIngredients) => [
        //   ...prevIngredients,
        //   { id: resData.name, ...ingredient },
        // ]);
        dispatch({
          type: 'ADD',
          ingredient: { id: resData.name, ...ingredient },
        });
      });
  }, []);

  const removeIngredientHandler = useCallback((ingredientId) => {
    dispatchHttp({ type: 'SEND' });
    fetch(
      `https://hooks-intro-51b69-default-rtdb.firebaseio.com/ingredients/${ingredientId}.json`,
      {
        method: 'DELETE',
      }
    )
      .then((res) => {
        dispatchHttp({ type: 'RESPONSE' });
        // setUserIngredients((prevIngredients) =>
        //   prevIngredients.filter((ingredient) => ingredient.id !== ingredientId)
        // );
        dispatch({ type: 'DELETE', id: ingredientId });
      })
      .catch((err) => {
        dispatchHttp({ type: 'ERROR', errorMessage: 'SOMETHING WENT WRONG' });
      });
  }, []);

  const clearError = useCallback(() => {
    dispatchHttp({ type: 'CLEAR' });
  }, []);

  const ingredientList = useMemo(() => {
    return (
      <IngredientList
        ingredients={userIngredients}
        onRemoveItem={removeIngredientHandler}
      />
    );
  }, [userIngredients, removeIngredientHandler]);

  return (
    <div className='App'>
      {httpState.error && (
        <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>
      )}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={httpState.loading}
      />

      <section>
        <Search onLoadIngredients={filterIngredientsHandler} />
        {ingredientList}
      </section>
    </div>
  );
};

export default Ingredients;
