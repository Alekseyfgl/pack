import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createAppAsyncThunk, thunkTryCatch } from '../../common/utils/thunks';
import { CurrentPackType, ICard, ICardDto, ICardQuery, ICardsByPackDomain } from './cards.interfaces';
import { cardsApi } from './cards.api';
import { Nullable } from '../../common/utils/types/optional.types';
import { getAllCardsMapper } from './utils/mappers/card.mapper';
import { logout } from '../Auth/auth.slice';
import { DomainDto } from '../../common/utils/types/domain-request.types';

const slice = createSlice({
    name: 'card',
    initialState: {
        cards: null as Nullable<ICard[]>,
        currentPack: null as Nullable<CurrentPackType>,
    },
    reducers: {
        resetCurrentPack: (state, action: PayloadAction<{}>) => {
            // console.log(current(state));
            state.cards = null;
            state.currentPack = null;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getAllCardsByPack.fulfilled, (state, action) => {
            state.cards = action.payload.cards;
            state.currentPack = action.payload.currentPack;
        });
        builder.addCase(logout.fulfilled, (state, action) => {
            state.cards = null;
            state.currentPack = null;
        });
    },
});

const getAllCardsByPack = createAppAsyncThunk<ICardsByPackDomain, ICardQuery>('card/getAllCardsByPack', async (arg: ICardQuery, thunkAPI) => {
    return thunkTryCatch(
        thunkAPI,
        async () => {
            const res = await cardsApi.getAllCardsByPack(arg);
            return getAllCardsMapper(res.data);
        },
        false
    );
});

const addCard = createAppAsyncThunk<void, DomainDto<ICardDto, null, ICardQuery>>(
    'packs/addPack',
    async (arg: DomainDto<ICardDto, null, ICardQuery>, thunkAPI) => {
        const { dispatch, getState, rejectWithValue } = thunkAPI;
        return thunkTryCatch(thunkAPI, async () => {
            console.log('DTO', arg.dto);
            await cardsApi.addCard(arg.dto);
            await dispatch(cardThunks.getAllCardsByPack(arg.query)).unwrap();
        });
    }
);
export const cardReducer = slice.reducer;
export const cardActions = slice.actions;
export const cardThunks = { getAllCardsByPack, addCard };
