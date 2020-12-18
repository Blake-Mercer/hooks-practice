import React, { useReducer, useCallback, useState, useEffect } from 'react';

import IngredientForm from './IngredientForm/IngredientForm';
import IngredientList from './IngredientList/IngredientList';
import ErrorModal from '../UI/ErrorModal/ErrorModal';
import Search from './Search/Search';
import ConfirmationModal from '../UI/ConfirmationModal/ConfirmationModal';
import ReducerTypes from './constants';
import useHttp from '../../hooks/http';

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

const Ingredients = () => {
  const {
    sendRequest,
    error,
    data,
    isLoading,
    reqExtra,
    reqIdentifier,
    clear,
  } = useHttp();
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const [showModal, setShowModal] = useState(false);
  const [activeIngredientIndex, setActiveIngredientIndex] = useState(null);

  // handling the http response from remove and add ingredients
  useEffect(() => {
    if (!isLoading && !error && reqIdentifier === 'REMOVE_INGREDIENT') {
      dispatch({ type: ReducerTypes.delete, id: reqExtra });
    } else if (!isLoading && !error && reqIdentifier === 'ADD_INGREDIENT') {
      dispatch({
        type: ReducerTypes.add,
        ingredient: { id: data.name, ...reqExtra },
      });
    }
  }, [data, reqExtra, error, isLoading, reqIdentifier]);

  const filterIngredientsHandler = useCallback((filterIngredients) => {
    dispatch({ type: ReducerTypes.set, ingredients: filterIngredients });
  }, []);

  const onIngredientClick = (index) => {
    console.log(userIngredients);
    setShowModal(true);
    setActiveIngredientIndex(index);
  };

  const onCancel = () => {
    setShowModal(false);
  };

  const addIngredientHandler = useCallback(
    (ingredient) => {
      sendRequest(
        'https://hooks-intro-51b69-default-rtdb.firebaseio.com/ingredients.json',
        'POST',
        JSON.stringify(ingredient),
        ingredient,
        'ADD_INGREDIENT'
      );
    },
    [sendRequest]
  );

  const removeIngredientHandler = useCallback(() => {
    sendRequest(
      `https://hooks-intro-51b69-default-rtdb.firebaseio.com/ingredients/${userIngredients[activeIngredientIndex].id}.json`,
      ReducerTypes.delete,
      null,
      userIngredients[activeIngredientIndex].id,
      'REMOVE_INGREDIENT'
    );
    setShowModal(false);
  }, [sendRequest, activeIngredientIndex, userIngredients]);

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
      {error && <ErrorModal onClose={clear}>{error}</ErrorModal>}
      {showModal && (
        <ConfirmationModal
          onCancel={onCancel}
          onContinue={removeIngredientHandler}
        />
      )}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={isLoading}
      />

      <section>
        <Search onLoadIngredients={filterIngredientsHandler} />
        {ingredientList()}
      </section>
    </div>
  );
};

export default Ingredients;
