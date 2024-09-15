// Dirección de la Bitcoin trasury del El Salvador
const address = '32ixEdVJWo3kmvJGMTZq5jAQVZZeuwnqzo';
// URL de la API de mempool.space para obtener la info de la direccion de SV
const balanceUrl = `https://mempool.space/api/address/${address}`;
// URL de la API de mempool.space para obtener el historial de transacciones
const transactionsUrl = `https://mempool.space/api/address/${address}/txs`;

// Obtener los últimos 30 días en Unix time
const currentTime = Math.floor(Date.now() / 1000);
const thirtyDaysAgo = currentTime - (30 * 24 * 60 * 60);
// Obtener los últimos 7 días en Unix time
const sevenDaysAgo = currentTime - (7 * 24 * 60 * 60);
// Realizar la solicitud usando fetch para obtener el balance
fetch(balanceUrl)
  .then(response => response.json())
  .then(data => {
    // El balance está en la propiedad "chain_stats.funded_txo_sum" (entrada de fondos) y "chain_stats.spent_txo_sum" (fondos gastados)
    const balanceInSatoshis = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;    
    // Convertir satoshis a BTC (1 BTC = 100,000,000 satoshis)
    const balanceInBTC = balanceInSatoshis / 100000000;
    //OBTENER EL BALANCE ON MEMPOOL XD
    const mempoolBalanceSatoshis = data.mempool_stats.funded_txo_sum - data.mempool_stats.spent_txo_sum;
    const mempoolBalanceBTC = mempoolBalanceSatoshis / 100000000;
    // Mostrar el balance en el doc HTML
    document.getElementById('balance').textContent = `Balance on Address: ${balanceInBTC} BTC`;
    document.getElementById('balanceOnMempool').textContent = `Balance on Mempool: ${mempoolBalanceBTC} BTC non confirmed transactions`;
    // Ahora, obtener el historial de transacciones
    return fetch(transactionsUrl);
  })

  //Creamos una consulta mas de la promesa response del fecth de balance
  .then(response => response.json())
  .then(transactions => {
    //Filtramos las transacciones de los ultimos 7 dias
    const lastSevenDays = transactions.filter(tx => tx.status.block_time >= sevenDaysAgo);
    // Filtrar transacciones que ocurrieron en los últimos 30 días
    const recentTransactions = transactions.filter(tx => tx.status.block_time >= thirtyDaysAgo);    
    // Crear una lista en el documento HTML para mostrar las transacciones de los ultimos 7 y 30 dias xd
    const lastSevenTransactionList= document.getElementById('lastSeven');
    const transactionsList = document.getElementById('transactions');
   
  
 
    //Recorremos los ultimos 7 dias con un foreach
    if(lastSevenDays.length  > 0){
        lastSevenDays.forEach(tx=> {
            const liItem= document.createElement('li', 'br');
            const time = new Date(tx.status.block_time *1000);//convertimos fecha
            const hash = tx.txid;
            const amount = tx.vout.reduce((total, outpot)=> total + outpot.value, 0)/100000000; //Convertimos SATS A bitcoin
            liItem.textContent=  `Transaction ID: ${hash}, Date: : ${time.toLocaleString()}, Amount: ${amount} BTC`;
            lastSevenTransactionList.appendChild(liItem);
        });
        
    }else{
        lastSevenTransactionList.textContent = 'No se encontraron transacciones en los ultimos 7 dias';
    }
 
    //Se recorren las ultimos 30 dias con un for each si se logran arrastrar mas de 0 datos
    if (recentTransactions.length > 0) {
        recentTransactions.forEach(tx => {
          const listItem = document.createElement('li', 'br');
          const blockTime = new Date(tx.status.block_time * 1000); // Convertir a fecha legible
          const txHash = tx.txid;
          const amountReceived = tx.vout.reduce((total, output) => total + output.value, 0) / 100000000; // Convertir satoshis a BTC
  
          listItem.textContent = `Transaction ID: ${txHash}, Date: : ${blockTime.toLocaleString()}, Amount: ${amountReceived} BTC`;
          transactionsList.appendChild(listItem);
        });
      } else {
        transactionsList.textContent = 'No se encontraron transacciones en los últimos 30 días.';
      }
  })
  .catch(error => {
    document.getElementById('balance').textContent = `Error al obtener el balance o historial de transacciones: ${error.message}`;
  });
