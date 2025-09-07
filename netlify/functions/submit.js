// netlify/functions/submit.js
// 注意：檔名已經改成 submit.js，對應端點就是 /.netlify/functions/submit

// Netlify (Node 18+) 已內建 fetch，不需要另外安裝 node-fetch

const GAS_URL = 'https://script.google.com/macros/s/AKfycbyh8TpqTtliuu4K8k_QMy2auTbwwfByyb80wLHP9Y1dratLvXI-aLrb9KFcdO5eYmoy/exec';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

exports.handler = async (event) => {
  // CORS 預檢處理
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: cors, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: cors,
      body: JSON.stringify({ ok: false, message: 'Method Not Allowed' })
    };
  }

  // 嘗試解析 JSON body
  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch (err) {
    return {
      statusCode: 400,
      headers: cors,
      body: JSON.stringify({ ok: false, message: 'Invalid JSON body' })
    };
  }

  try {
    // 轉發到 Apps Script Web App
    const resp = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data)
    });

    const text = await resp.text();

    return {
      statusCode: resp.ok ? 200 : (resp.status || 502),
      headers: { ...cors, 'Content-Type': 'application/json' },
      body: text
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: cors,
      body: JSON.stringify({ ok: false, message: error.message })
    };
  }
};