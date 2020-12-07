import React, { useReducer, useCallback, useState } from 'react';

import IngredientForm from './IngredientForm/IngredientForm';
import IngredientList from './IngredientList/IngredientList';
import ErrorModal from '../UI/ErrorModal/ErrorModal';
import Search from './Search/Search';
import ConfirmationModal from '../UI/ConfirmationModal/ConfirmationModal';
import ReducerTypes from './constants';

// Trying to implement the Confirmation Modal before someone deletes a list item. I cannot figure out the logic currently.

const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case ReducerTypes.set:
      return action.ingredients;
    case ReducerTypes.add:
      return [...currentIngredients, action.ingredient];
    case ReducerTypes.delete:
      return currentIngredients.filter((ing) => ing.id !== action.id);
    default:
      throw new Error('BRO TF?? you smell like dry dick');
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
  const [showModal, setShowModal] = useState(false);
  const [activeIngredientIndex, setActiveIngredientIndex] = useState(null);
  const filterIngredientsHandler = useCallback((filterIngredients) => {
    // setUserIngredients(filterIngredients);
    dispatch({ type: ReducerTypes.set, ingredients: filterIngredients });
  }, []);

  const onIngredientClick = (index) => {
    setShowModal(true);
    setActiveIngredientIndex(index);
  };

  const onCancel = () => {
    setShowModal(false);
  };

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
          type: ReducerTypes.add,
          ingredient: { id: resData.name, ...ingredient },
        });
      });
  }, []);

  const removeIngredientHandler = () => {
    dispatchHttp({ type: 'SEND' });
    fetch(
      `https://hooks-intro-51b69-default-rtdb.firebaseio.com/ingredients/${userIngredients[activeIngredientIndex].id}.json`,
      {
        //idk what this is doing
        method: ReducerTypes.delete,
      }
    )
      .then((res) => {
        dispatchHttp({ type: 'RESPONSE' });
        // setUserIngredients((prevIngredients) =>
        //   prevIngredients.filter((ingredient) => ingredient.id !== index)
        // );
        dispatch({
          type: ReducerTypes.delete,
          id: userIngredients[activeIngredientIndex].id,
        });
        setShowModal(false);
      })
      .catch((err) => {
        dispatchHttp({ type: 'ERROR', errorMessage: 'SOMETHING WENT WRONG' });
        // its working just failing cuz https
        dispatch({
          type: ReducerTypes.delete,
          id: userIngredients[activeIngredientIndex].id,
        });
        setShowModal(false);
      });
  };

  const clearError = useCallback(() => {
    dispatchHttp({ type: 'CLEAR' });
  }, []);

  const ingredientList = () => {
    return (
      <IngredientList
        ingredients={userIngredients}
        onIngredientClick={onIngredientClick}
      />
    );
  };

  return (
    <div className='App'>
      {httpState.error && (
        <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>
      )}
      {showModal && (
        <ConfirmationModal
          onCancel={onCancel}
          onContinue={removeIngredientHandler}
        />
      )}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={httpState.loading}
      />

      <section>
        <Search onLoadIngredients={filterIngredientsHandler} />
        {ingredientList()}
      </section>
    </div>
  );
};

export default Ingredients;
