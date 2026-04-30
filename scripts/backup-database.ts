import 'dotenv/config'; // ✅ ADICIONAR ESTA LINHA NO TOPO
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

async function backupDatabase() {
  try {
    // Extrair senha da DATABASE_URL
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      console.error('❌ Erro: DATABASE_URL não encontrada no .env');
      console.error('💡 Verifique se o arquivo .env está na raiz do projeto');
      process.exit(1);
    }

    console.log('✅ DATABASE_URL carregada com sucesso');

    // Parse da URL: mysql://user:password@host:port/database
    const urlMatch = databaseUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    
    if (!urlMatch) {
      console.error('❌ Erro: Formato inválido da DATABASE_URL');
      console.error('DATABASE_URL:', databaseUrl);
      process.exit(1);
    }

    const [, user, password, host, port, database] = urlMatch;

    console.log('\n📋 Configuração:');
    console.log(`   Usuário: ${user}`);
    console.log(`   Host: ${host}`);
    console.log(`   Porta: ${port}`);
    console.log(`   Banco: ${database}`);
    console.log(`   Senha: ${'*'.repeat(password.length)}\n`);

    // Criar pasta backups
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
      console.log('📁 Pasta backups criada');
    }

    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '');
    const backupPath = path.join(backupDir, `backup-${date}-${time}.sql`);
    
    console.log(`🗂️  Salvando backup em: ${backupPath}\n`);

    // Caminho do mysqldump
    const mysqldumpPath = path.join(
      process.env.APPDATA || '',
      'DBeaverData',
      'drivers',
      'clients',
      'mysql_8',
      'win',
      'mysqldump.exe'
    );

    if (!fs.existsSync(mysqldumpPath)) {
      console.error('❌ mysqldump não encontrado em:', mysqldumpPath);
      console.log('\n💡 Use o DBeaver:');
      console.log('   1. Botão direito no banco');
      console.log('   2. Ferramentas → Backup do Banco de Dados');
      console.log('   3. Em Avançado adicione: --skip-column-statistics');
      process.exit(1);
    }

    console.log('📦 Iniciando backup...');

    // Escapar senha para linha de comando
    const escapedPassword = password.replace(/!/g, '^!');

    // Comando
    const command = `"${mysqldumpPath}" --skip-column-statistics -u ${user} -p${escapedPassword} -h ${host} -P ${port} --single-transaction --routines ${database} > "${backupPath}"`;

    await execAsync(command, { 
      shell: 'cmd.exe',
      maxBuffer: 50 * 1024 * 1024
    });

    // Verificar arquivo
    if (fs.existsSync(backupPath)) {
      const stats = fs.statSync(backupPath);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`\n✅ Backup concluído com sucesso!`);
      console.log(`📊 Tamanho: ${sizeInMB} MB`);
      console.log(`📍 Local: ${backupPath}\n`);
    } else {
      console.error('❌ Arquivo de backup não foi criado');
    }

  } catch (error: any) {
    console.error('\n❌ Erro no backup:');
    
    if (error.stderr) {
      console.error(error.stderr);
    }
    
    if (error.message.includes('Access denied')) {
      console.error('\n💡 Senha incorreta ou usuário sem permissão');
      console.error('   Use o DBeaver para fazer backup manualmente');
    }
    
    process.exit(1);
  }
}

backupDatabase();