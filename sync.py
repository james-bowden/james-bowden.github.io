import shutil
from glob import glob

DIR_PATH = '/Users/jcbowden/Documents/Obsidian Vault/james-bowden.github.io/pages/vault'
VAULT_PATH = '/Users/jcbowden/Documents/Obsidian Vault'

def sync(original_path, pub_path):
	print(f'{original_path} --> {pub_path}')
	title = original_path.split('/')[-1]
	shutil.copy(original_path, f'{DIR_PATH}/{pub_path}/{title}')

def write_index(source):
	dest = '/'.join(source.split('/')[:-1]) + '/index.md'
	title = source.split('/')[-1].split('_')[-1] # _index_title

	try:
		with open(source, 'r', encoding='utf-8') as source_file:
			content = source_file.readlines()
		
		# Create new content with title
		new_content = [f"### {title}\n\n"] + content

		# print(dest)

		# print(new_content)
		
		# Write to target file
		with open(dest, 'w', encoding='utf-8') as target_file:
		    target_file.writelines(new_content)
		
	except FileNotFoundError:
		print(f"Error: Could not find {source}")
	except Exception as e:
		print(f"An error occurred: {str(e)}")
	

def sync_index(verbose=False):
	fnames = glob(f'{DIR_PATH}/**/_index_*', recursive=True)
	if verbose: print(fnames)
	for f in fnames:
		write_index(f)

def sync_atomic(verbose=False):
	fnames = glob(f'{VAULT_PATH}/**/_a_*', recursive=True)
	if verbose: print(fnames)
	for f in fnames:
		if DIR_PATH in f: continue
		sync(f, 'atomic')

if __name__ == "__main__":
	sync_index()
	sync_atomic()

	# maybe make a separate csv that gets edited?
	sync(f'{VAULT_PATH}/__ref/yogas.md', 'lists')
	sync(f'{VAULT_PATH}/__ref/Engagement Queue.md', 'for_self')
	sync(f'{VAULT_PATH}/__ref/Engagement List — Hum.md', 'for_self')
