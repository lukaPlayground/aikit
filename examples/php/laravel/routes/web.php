<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AIKitController;

Route::get('/', function () {
    return view('welcome');
});

// AIKit 라우트 추가
Route::get('/aikit', [AIKitController::class, 'index']);
Route::post('/aikit/chat', [AIKitController::class, 'chat']);