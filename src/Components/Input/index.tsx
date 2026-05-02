import { View, Text, TextInput, Button, Pressable } from 'react-native';
import { AppActionTypes, AppContext } from '../../Context/AppContext';
import React from 'react';
import { SqLiteHandler } from '../../Utils/sqlite';
import { ToastContext } from '../../Context/ToastContext';

const ExpenseInput = () => {
  const context = React.useContext(AppContext);
  const toastContext = React.useContext(ToastContext);
  const { state, dispatch, sqliteHandler } = context as {
    state: any;
    dispatch: React.Dispatch<any>;
    sqliteHandler: SqLiteHandler | null;
  };
  const handleInputChange = (text: string) => {
    dispatch({ type: AppActionTypes.SET_EXPENSE_INPUT_TEXT, payload: text });
  };

  const handleOnSubmit = () => {
    console.log('Submitting expense: ', state.expenseInputText);
  };

  const handleOnReadClick = () => {
    if (sqliteHandler) {
      sqliteHandler
        .readExpenses()
        .then(expenses => {
          console.log('Expenses read from database: ', expenses);
        })
        .catch(error => {
          console.error('Error reading expenses from database: ', error);
        });
    }
  };

  const writeAnExpenseToDb = () => {
    if (sqliteHandler) {
      sqliteHandler
        .writeExpense({
          id: '1',
          description: 'Lunch with friends',
          amount: 45,
          currency: 'USD',
          date: new Date(),
          vendor: 'Restaurant',
          purpose: 'Social',
          type: 'offline',
          bankAccount: '1234567890',
          transactionRecipt: 'receipt.jpg',
        })
        .then(res => {
          console.log('Expense write result: ', res);
        })
        .catch(error => {
          console.error('Error writing expense to database: ', error);
        });
    }
  };

  const handleShowToast = () => {
    toastContext.showToast('This is a toast message from ages!');
  };

  return (
    <View>
      <Text>Enter your expense in natural language</Text>
      <TextInput
        placeholder="e.g., Lunch with friends for $45 at 1pm"
        onChangeText={handleInputChange}
        value={state.expenseInputText}
      />
      <Button title="Add" onPress={handleOnSubmit} />
      <Button title="Read Expenses from DB" onPress={handleOnReadClick} />
      <Button title="Write Sample Expense to DB" onPress={writeAnExpenseToDb} />
      <Pressable onPress={handleShowToast}>
        <Text>Show Toast</Text>
      </Pressable>
    </View>
  );
};

export { ExpenseInput };
